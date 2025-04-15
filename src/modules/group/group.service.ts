import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository, wrap } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { err, ok, Result } from 'neverthrow';
import { DatabaseError } from 'src/shared/errors/database.error';
import { EntityNotFoundError } from 'src/shared/errors/entity-not-found.error';
import { CreateGroupRequestDto } from './dto/create-group.dto';
import { GroupEntity } from './entities/group.entity';
import { UserGroupEntity } from '../user_group/entities/user_group.entity';
import { UserEntity } from '../user/entities/user.entity';
import { AddUserRequestDto } from '../user_group/dto/add-user-request.dto';
import { CloudinaryService } from '../files/impl/cloudinary.service';
import { UnauthorizedError } from '../session/errors/unauthorized.error';
import { UpdateGroupRequestDto } from './dto/update-group.dto';
import { UserAlreadyJoinError } from './errors/user-already-join.error';
import { NotOwnerError } from './errors/not-owner.error';
import { GroupError } from './errors/base-group.error';
import { LogoUploadError } from './errors/logo-upload.error';

//Pagination later
@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: EntityRepository<GroupEntity>,
    @InjectRepository(UserGroupEntity)
    private readonly userGroupRepository: EntityRepository<UserGroupEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: EntityRepository<UserEntity>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly entityManager: EntityManager,
  ) {}

  async createGroup(
    createGroupDto: CreateGroupRequestDto,
    requesterId: string,
    logo?: Express.Multer.File,
  ): Promise<Result<GroupEntity, DatabaseError | GroupError>> {
    try {
      let logoUrl: string | undefined;

      if (logo) {
        const uploadResult = await this.cloudinaryService.uploadFile(logo);

        if (uploadResult.isErr()) {
          return err(new LogoUploadError(uploadResult.error.message));
        }

        logoUrl = uploadResult.value.url;
      }

      const owner = await this.userRepository.findOne({ id: requesterId });
      if (!owner) {
        return err(new EntityNotFoundError('User', requesterId));
      }

      const group = this.groupRepository.create({
        groupName: createGroupDto.groupName,
        logoImage:
          logoUrl ??
          `https://api.dicebear.com/9.x/initials/svg?seed=${createGroupDto.groupName}`,
        owner: owner,
      });

      const userGroup = this.userGroupRepository.create({
        user: owner,
        group: group,
      });

      await this.entityManager.transactional(async (em) => {
        await em.persistAndFlush([group, userGroup]);
      });

      return ok(group);
    } catch (error) {
      return err(new DatabaseError('Group creation failed!'));
    }
  }

  async deleteGroup(
    groupId: string,
    requesterId: string,
  ): Promise<
    Result<null, DatabaseError | EntityNotFoundError | UnauthorizedError>
  > {
    const group = await this.groupRepository.findOne({ id: groupId });

    if (!group) {
      return err(new EntityNotFoundError('Group', groupId));
    }

    if (requesterId !== group.owner.id) {
      return err(new NotOwnerError(requesterId, groupId));
    }

    try {
      await this.entityManager.removeAndFlush(group);

      return ok(null);
    } catch (error) {
      return err(new DatabaseError('Group deletion failed!'));
    }
  }

  async getGroupById(
    group_id: string,
  ): Promise<Result<GroupEntity, EntityNotFoundError>> {
    const group = await this.groupRepository.findOne(
      { id: group_id },
      { populate: ['users'] },
    );
    if (!group) {
      return err(new EntityNotFoundError('Group', group_id));
    }

    return ok(group);
  }

  async updateGroup(
    groupId: string,
    updateGroupDto: UpdateGroupRequestDto,
    requesterId: string,
    logo?: Express.Multer.File,
  ): Promise<Result<GroupEntity, GroupError | DatabaseError>> {
    let logoUrl: string | undefined;

    if (logo) {
      const uploadResult = await this.cloudinaryService.uploadFile(logo);

      if (uploadResult.isErr()) {
        return err(new LogoUploadError(uploadResult.error.message));
      }
      logoUrl = uploadResult.value.url;
    }

    const group = await this.groupRepository.findOne({ id: groupId });
    if (!group) {
      return err(new EntityNotFoundError('Group', groupId));
    }

    if (requesterId !== group.owner.id) {
      return err(new NotOwnerError(requesterId, groupId));
    }

    try {
      wrap(group).assign({
        ...updateGroupDto,
        logoImage: logoUrl ?? group.logoImage,
      });

      await this.entityManager.persistAndFlush(group);

      return ok(group);
    } catch (error) {
      return err(new DatabaseError('Group update failed!'));
    }
  }

  async addUser(
    groupId: string,
    addUserDto: AddUserRequestDto,
    requesterId: string,
  ): Promise<Result<UserGroupEntity, DatabaseError | GroupError>> {
    const group = await this.groupRepository.findOne({ id: groupId });
    if (!group) {
      return err(new EntityNotFoundError('Group', groupId));
    }

    if (requesterId !== group.owner.id) {
      return err(new NotOwnerError(requesterId, groupId));
    }

    const { userId } = addUserDto;
    const user = await this.userRepository.findOne({ id: userId });
    if (!user) {
      return err(new EntityNotFoundError('User', userId));
    }

    const existingMembership = await this.userGroupRepository.findOne({
      user,
      group,
    });
    if (existingMembership) {
      return err(new UserAlreadyJoinError(userId, groupId));
    }

    try {
      const userGroup = this.userGroupRepository.create({
        user,
        group,
      });

      await this.entityManager.persistAndFlush(userGroup);

      return ok(userGroup);
    } catch (error) {
      return err(new DatabaseError('Error during userGroup creation'));
    }
  }

  async removeUser(
    userId: string,
    groupId: string,
    requesterId: string,
  ): Promise<Result<null, DatabaseError | GroupError>> {
    const group = await this.groupRepository.findOne({ id: groupId });

    if (!group) {
      return err(new EntityNotFoundError('Group', groupId));
    }

    if (requesterId !== group.owner.id) {
      return err(new NotOwnerError(requesterId, groupId));
    }

    const user = await this.userRepository.findOne({ id: userId });
    if (!user) {
      return err(new EntityNotFoundError('User', userId));
    }

    const userGroup = await this.userGroupRepository.findOne({
      user: { id: userId },
      group: { id: groupId },
    });
    if (!userGroup) {
      return err(new EntityNotFoundError('UserGroup', userId + groupId));
    }

    try {
      await this.entityManager.removeAndFlush(userGroup);
      return ok(null);
    } catch (error) {
      return err(new DatabaseError('Error during userGroup deletion'));
    }
  }

  async getUsers(groupId: string): Promise<Result<UserEntity[], GroupError>> {
    const group = await this.groupRepository.findOne(
      { id: groupId },
      { populate: ['users'] },
    );
    if (!group) {
      return err(new EntityNotFoundError('Group', groupId));
    }

    return ok(group.users.getItems());
  }
}
