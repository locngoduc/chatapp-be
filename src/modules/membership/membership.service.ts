import { Injectable } from '@nestjs/common';
import { CreateMembershipRequestDto } from './dto/create-membership.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { MembershipEntity } from './entities/membership.entity';
import { UserEntity } from '../user/entities/user.entity';
import { GroupEntity } from '../group/entities/group.entity';
import {
  EntityManager,
  EntityRepository,
  MikroORM,
  Transactional,
} from '@mikro-orm/postgresql';
import { err, ok, Result } from 'neverthrow';
import { MembershipError } from './errors/base-membership.error';
import { SuccessResponse } from 'src/shared/classes/wrapper';
import { EntityNotFoundError } from 'src/shared/errors/entity-not-found.error';

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
  ): Promise<Result<MembershipEntity, MembershipError>> {
    try {
      const { userId, groupId, lastSeenAt } = createMembershipDto;

      const user = await this.userRepository.findOne({ id: userId });
      if (!user) {
        return err(new EntityNotFoundError('User', userId));
      }

      const group = await this.groupRepository.findOne({ id: groupId });
      if (!group) {
        return err(new EntityNotFoundError('Group', groupId));
      }

      const membership = this.membershipRepository.create({
        user,
        group,
        lastSeenAt,
      });

      await this.entityManager.persistAndFlush(membership);
      return ok(membership);
    } catch (error) {
      console.error('Error creating membership:', error);
      return err(new MembershipError('Error during membership creation'));
    }
  }

  async delete(
    userId: string,
    groupId: string,
  ): Promise<Result<SuccessResponse, MembershipError>> {
    const membership = await this.membershipRepository.findOne({
      user: userId,
      group: groupId,
    });
    if (!membership) {
      return err(new EntityNotFoundError('Membership', userId + groupId));
    }

    await this.entityManager.removeAndFlush(membership);
    return ok(new SuccessResponse('Delete Membership Successfully'));
  }

  async getGroupsByUserId(
    userId: string,
  ): Promise<Result<SuccessResponse<GroupEntity[]>, MembershipError>> {
    const user = await this.userRepository.findOne(
      { id: userId },
      { populate: ['groups'] },
    );

    if (!user) {
      return err(new EntityNotFoundError('User', userId));
    }
    return ok(
      new SuccessResponse<GroupEntity[]>(
        'Get Groups by User ID Successfully',
        user.groups.getItems(),
      ),
    );
  }

  async getUsersByGroupId(
    groupId: string,
  ): Promise<Result<SuccessResponse<UserEntity[]>, MembershipError>> {
    const group = await this.groupRepository.findOne(
      { id: groupId },
      { populate: ['users'] },
    );
    if (!group) {
      return err(new EntityNotFoundError('Group', groupId));
    }

    return ok(
      new SuccessResponse<UserEntity[]>(
        'Get Users by Group ID Successfully',
        group.users.getItems(),
      ),
    );
  }
}
