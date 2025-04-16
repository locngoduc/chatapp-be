import {
  BeforeCreate,
  Collection,
  Entity,
  ManyToMany,
  Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { IsEmail } from 'class-validator';
import { GroupEntity } from '../../group/entities/group.entity';
import { UserGroupEntity } from '../../user_group/entities/user_group.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity({ tableName: 'users' })
export class UserEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string & Opt = uuidv4();

  @Property({ name: 'first_name' })
  firstName!: string;

  @Property({ name: 'last_name' })
  lastName!: string;

  @Property({ name: 'middle_name', nullable: true })
  middleName?: string;

  @Property({ name: 'email', unique: true })
  @IsEmail()
  email!: string;

  @Property({ name: 'hashed_password', hidden: true })
  hashedPassword!: string;

  @Property({ name: 'profile_image' })
  profileImage?: string & Opt;

  @Property({ name: 'last_online_at', type: 'datetime' })
  lastOnlineAt: Date = new Date();

  @Property({ name: 'is_online', type: 'boolean' })
  isOnline: boolean = false;

  @BeforeCreate()
  setDefaultProfileImage() {
    if (!this.profileImage) {
      this.profileImage = `https://api.dicebear.com/9.x/initials/svg?seed=${this.firstName + this.lastName}`;
    }
  }

  @ManyToMany({
    entity: () => GroupEntity,
    pivotEntity: () => UserGroupEntity,
    inversedBy: (e) => e.users,
  })
  groups = new Collection<GroupEntity>(this);
}
