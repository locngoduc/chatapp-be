import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { err, ok, Result } from 'neverthrow';
import { DatabaseError } from 'src/shared/errors/database.error';
import { EntityNotFoundError } from 'src/shared/errors/entity-not-found.error';
import { GroupEntity } from '../group/entities/group.entity';
import { UserEntity } from '../user/entities/user.entity';
import { CreateMembershipRequestDto } from './dto/create-membership.dto';
import { MembershipEntity } from './entities/membership.entity';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(MembershipEntity)
    private readonly membershipRepository: EntityRepository<MembershipEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: EntityRepository<UserEntity>,
    @InjectRepository(GroupEntity)
    private readonly groupRepository: EntityRepository<GroupEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  // Pagination added later

  public async createMembership(
    createMembershipDto: CreateMembershipRequestDto,
  ): Promise<Result<MembershipEntity, DatabaseError | EntityNotFoundError>> {
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
      const membership = this.membershipRepository.create({
        user,
        group,
      });

      await this.entityManager.persistAndFlush(membership);

      return ok(membership);
    } catch (error) {
      return err(new DatabaseError('Error during membership creation'));
    }
  }

  async delete(
    userId: string,
    groupId: string,
  ): Promise<Result<null, DatabaseError | EntityNotFoundError>> {
    const membership = await this.membershipRepository.findOne({
      user: userId,
      group: groupId,
    });

    if (!membership) {
      return err(new EntityNotFoundError('Membership', userId + groupId));
    }

    try {
      await this.entityManager.removeAndFlush(membership);
      return ok(null);
    } catch (error) {
      return err(new DatabaseError('Error during membership deletion'));
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
