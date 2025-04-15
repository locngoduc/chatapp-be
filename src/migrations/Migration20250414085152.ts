import { Migration } from '@mikro-orm/migrations';

export class Migration20250414085152 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "users" ("id" uuid not null, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "middle_name" varchar(255) null, "email" varchar(255) not null, "hashed_password" varchar(255) not null, "profile_image" varchar(255) null, "last_online_at" timestamptz not null, "is_online" boolean not null default false, constraint "users_pkey" primary key ("id"));`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);

    this.addSql(`create table "groups" ("id" uuid not null, "group_name" varchar(255) not null, "logo_image" varchar(255) null, "owner_id" uuid not null, constraint "groups_pkey" primary key ("id"));`);

    this.addSql(`create table "user_groups" ("user_id" uuid not null, "group_id" uuid not null, "last_seen_at" timestamptz null, constraint "user_groups_pkey" primary key ("user_id", "group_id"));`);

    this.addSql(`alter table "groups" add constraint "groups_owner_id_foreign" foreign key ("owner_id") references "users" ("id") on update cascade;`);

    this.addSql(`alter table "user_groups" add constraint "user_groups_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`);
    this.addSql(`alter table "user_groups" add constraint "user_groups_group_id_foreign" foreign key ("group_id") references "groups" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "groups" drop constraint "groups_owner_id_foreign";`);

    this.addSql(`alter table "user_groups" drop constraint "user_groups_user_id_foreign";`);

    this.addSql(`alter table "user_groups" drop constraint "user_groups_group_id_foreign";`);

    this.addSql(`drop table if exists "users" cascade;`);

    this.addSql(`drop table if exists "groups" cascade;`);

    this.addSql(`drop table if exists "user_groups" cascade;`);
  }

}
