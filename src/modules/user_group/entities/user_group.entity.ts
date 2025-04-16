import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { GroupEntity } from '../../group/entities/group.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity({ tableName: 'user_groups' })
export class UserGroupEntity {
  @ManyToOne({ primary: true })
  user: UserEntity;

  @ManyToOne({ primary: true })
  group: GroupEntity;

  @Property({ type: 'Date', nullable: true })
  lastSeenAt: Date;
}
