import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { err, ok, Result } from 'neverthrow';
import { SuccessResponse } from 'src/shared/classes/wrapper/success-response-wrapper';
import { DatabaseError } from 'src/shared/errors/database.error';
import { EntityNotFoundError } from 'src/shared/errors/entity-not-found.error';
import { CreateGroupRequestDto } from './dto/create-group.dto';
import { GroupEntity } from './entities/group.entity';
import { UserGroupEntity } from '../user_group/entities/user_group.entity';
import { UserEntity } from '../user/entities/user.entity';
import { AddUserRequestDto } from '../user_group/dto/add-user-request.dto';

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
    private readonly entityManager: EntityManager,
  ) {}

  async create(
    createGroupDto: CreateGroupRequestDto,
  ): Promise<Result<GroupEntity, DatabaseError>> {
    // Call cloudinary to upload the image and get the URL

    try {
      const group = this.groupRepository.create({
        groupName: createGroupDto.groupName,
        // For now, we are using a placeholder image
        logoImage: 'https://placehold.co/40/png',
      });

      await this.entityManager.persistAndFlush(group);

      return ok(group);
    } catch (error) {
      return err(new DatabaseError('Group creation failed!'));
    }
  }

  async remove(
    id: string,
  ): Promise<Result<null, DatabaseError | EntityNotFoundError>> {
    const group = await this.groupRepository.findOne(id);

    if (!group) {
      return err(new EntityNotFoundError('Group', id));
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
  ): Promise<Result<UserGroupEntity, DatabaseError | EntityNotFoundError>> {
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
  ): Promise<Result<null, DatabaseError | EntityNotFoundError>> {
    const userGroup = await this.userGroupRepository.findOne({
      user: userId,
      group: groupId,
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
