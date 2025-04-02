import { Injectable } from '@nestjs/common';
import { CreateGroupRequestDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { GroupEntity } from './entities/group.entity';
import { err, ok, Result } from 'neverthrow';
import { CursorPaginationWrapper } from 'src/shared/classes/wrapper/cursor-pagination-wrapper';
import { SuccessResponse } from 'src/shared/classes/wrapper/success-response-wrapper';
import { GroupError } from './errors/base-group.error';
import { EntityNotFoundError } from 'src/shared/errors/entity-not-found.error';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: EntityRepository<GroupEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  //Pagination later

  create(
    createGroupDto: CreateGroupRequestDto,
  ): Result<SuccessResponse<GroupEntity>, GroupError> {
    const group = this.groupRepository.create({
      groupName: createGroupDto.groupName,
      logoImage: createGroupDto.logoImage,
    });

    this.entityManager.persistAndFlush(group);

    return ok(
      new SuccessResponse<GroupEntity>('Create group successfully!', group),
    );
  }

  findAll() {
    const groups = this.groupRepository.findAll();

    return `This action returns all group`;
  }

  findOne(id: string) {
    return `This action returns a group`;
  }

  update(id: number, updateGroupDto: UpdateGroupDto) {
    return `This action updates a #${id} group`;
  }

  async remove(id: string) {
    const group = this.groupRepository.findOne(id);

    if (!group) {
      return err(new EntityNotFoundError('Group', id));
    }

    await this.entityManager.removeAndFlush(group);

    return ok(new SuccessResponse('Delete group successfully!'));
  }
}
