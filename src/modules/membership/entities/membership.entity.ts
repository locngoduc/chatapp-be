import { BeforeCreate, Entity, ManyToOne, Property } from '@mikro-orm/core';
import { GroupEntity } from '../../group/entities/group.entity';
import { UserEntity } from '../../user/entities/user.entity';

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
