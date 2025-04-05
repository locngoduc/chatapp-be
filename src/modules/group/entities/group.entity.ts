import {
  BeforeCreate,
  Collection,
  Entity,
  ManyToMany,
  Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { UserGroupEntity } from '../../user_group/entities/user_group.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity({ tableName: 'groups' })
export class GroupEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string & Opt = uuidv4();

  @Property({ name: 'group_name' })
  groupName!: string;

  @Property({ name: 'logo_image' })
  logoImage?: string & Opt;

  @ManyToMany({
    entity: () => UserEntity,
    pivotEntity: () => UserGroupEntity,
    mappedBy: (e) => e.groups,
  })
  users = new Collection<UserEntity>(this);

  @BeforeCreate()
  setDefaultProfileImage() {
    if (!this.logoImage) {
      this.logoImage = `https://api.dicebear.com/9.x/initials/svg?seed=${this.groupName}`;
    }
  }
}
