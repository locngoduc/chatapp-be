import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
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
import { FileUploadError } from '../files/dtos/file-upload-error.dto';

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

  async create(
    createGroupDto: CreateGroupRequestDto,
    logo: Express.Multer.File,
  ): Promise<Result<GroupEntity, DatabaseError | FileUploadError>> {
    const uploadResult = await this.cloudinaryService.uploadFile(logo, {
      id: createGroupDto.groupName,
      metadata: {
        tags: ['group'],
      },
    });

    if (uploadResult.isErr()) {
      return err(uploadResult.error);
    }

    try {
      const group = this.groupRepository.create({
        groupName: createGroupDto.groupName,
        logoImage: uploadResult.value.url,
      });

      await this.entityManager.persistAndFlush(group);

      return ok(group);
    } catch (error) {
      return err(new DatabaseError('Group creation failed!'));
    }
  }

  async deleteGroup(
    groupId: string,
    requesterId: string,
  ): Promise<Result<null, DatabaseError | EntityNotFoundError>> {
    // Check if the requester is an admin of the group

    const group = await this.groupRepository.findOne(groupId);

    if (!group) {
      return err(new EntityNotFoundError('Group', groupId));
    }

    try {
      await this.entityManager.removeAndFlush(group);

      return ok(null);
    } catch (error) {
      return err(new DatabaseError('Group deletion failed!'));
    }
  }

  async addUser(
    groupId: string,
    createMembershipDto: AddUserRequestDto,
    requesterId: string,
  ): Promise<Result<UserGroupEntity, DatabaseError | EntityNotFoundError>> {
    // Check if the requester is an admin of the group

    const { userId } = createMembershipDto;

    const user = await this.userRepository.findOne({ id: userId });
    if (!user) {
      return err(new EntityNotFoundError('User', userId));
    }

    const group = await this.groupRepository.findOne({ id: groupId });
    if (!group) {
      return err(new EntityNotFoundError('Group', groupId));
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
  ): Promise<Result<null, DatabaseError | EntityNotFoundError>> {
    const group = await this.groupRepository.findOne({ id: groupId });

    if (!group) {
      return err(new EntityNotFoundError('Group', groupId));
    }

    if (requesterId !== group.ownerId) {
      // Waiting for the authentication service to be merged
      //return err(new UnauthorizedError('User is not the owner of the group'));
    }

    const userGroup = await this.userGroupRepository.findOne({
      user: userId,
      group: groupId,
    });

    if (!userGroup) {
      return err(new EntityNotFoundError('UserGroup', userId + groupId));
    }

    const user = await this.userRepository.findOne({ id: userId });

    if (!user) {
      return err(new EntityNotFoundError('User', userId));
    }

    try {
      await this.entityManager.removeAndFlush(userGroup);
      return ok(null);
    } catch (error) {
      return err(new DatabaseError('Error during userGroup deletion'));
    }
  }

  async getUsers(
    groupId: string,
  ): Promise<Result<UserEntity[], EntityNotFoundError>> {
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
