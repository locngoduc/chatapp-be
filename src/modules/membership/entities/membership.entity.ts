import {
  BeforeCreate,
  Entity,
  ManyToMany,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { GroupEntity } from 'src/modules/group/entities/group.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';

@Entity({ tableName: 'memberships' })
export class MembershipEntity {
  @ManyToOne({ primary: true })
  user: UserEntity;

  @ManyToOne({ primary: true })
  group: GroupEntity;

  @Property({ type: 'Date' })
  lastSeenAt!: Date;

  @BeforeCreate()
  setLastSeenAt() {
    this.lastSeenAt = new Date();
  }
}
