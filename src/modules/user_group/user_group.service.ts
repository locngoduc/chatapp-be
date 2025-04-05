import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { err, ok, Result } from 'neverthrow';
import { DatabaseError } from 'src/shared/errors/database.error';
import { EntityNotFoundError } from 'src/shared/errors/entity-not-found.error';
import { GroupEntity } from '../group/entities/group.entity';
import { UserEntity } from '../user/entities/user.entity';
import { CreateUserGroupRequestDto } from './dto/create-user_group.dto';
import { UserGroupEntity } from './entities/user_group.entity';

@Injectable()
export class UserGroupService {
  constructor(
    @InjectRepository(UserGroupEntity)
    private readonly userGroupRepository: EntityRepository<UserGroupEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: EntityRepository<UserEntity>,
    @InjectRepository(GroupEntity)
    private readonly groupRepository: EntityRepository<GroupEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  // Pagination added later

  public async createUserGroup(
    createMembershipDto: CreateUserGroupRequestDto,
  ): Promise<Result<UserGroupEntity, DatabaseError | EntityNotFoundError>> {
    const { userId, groupId } = createMembershipDto;

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

  async delete(
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

  async getGroupsByUserId(
    userId: string,
  ): Promise<Result<GroupEntity[], EntityNotFoundError>> {
    const user = await this.userRepository.findOne(
      { id: userId },
      { populate: ['groups'] },
    );

    if (!user) {
      return err(new EntityNotFoundError('User', userId));
    }

    return ok(user.groups.getItems());
  }

  async getUsersByGroupId(
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
