import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { err, ok, Result } from 'neverthrow';
import { SuccessResponse } from 'src/shared/classes/wrapper/success-response-wrapper';
import { DatabaseError } from 'src/shared/errors/database.error';
import { EntityNotFoundError } from 'src/shared/errors/entity-not-found.error';
import { CreateGroupRequestDto } from './dto/create-group.dto';
import { GroupEntity } from './entities/group.entity';

//Pagination later
@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: EntityRepository<GroupEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  async create(
    createGroupDto: CreateGroupRequestDto,
  ): Promise<Result<GroupEntity, DatabaseError>> {
    try {
      const group = this.groupRepository.create({
        groupName: createGroupDto.groupName,
        logoImage: createGroupDto.logoImage,
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
}
