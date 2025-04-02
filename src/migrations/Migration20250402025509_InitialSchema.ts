import { Migration } from '@mikro-orm/migrations';

export class Migration20250402025509_InitialSchema extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "groups" ("id" uuid not null, "group_name" varchar(255) not null, "logo_image" varchar(255) null, constraint "groups_pkey" primary key ("id"));`);

    this.addSql(`create table "users" ("id" uuid not null, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "middle_name" varchar(255) null, "email" varchar(255) not null, "hashed_password" varchar(255) not null, "profile_image" varchar(255) null, "last_online_at" timestamptz not null, "is_online" boolean not null default false, constraint "users_pkey" primary key ("id"));`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);

    this.addSql(`create table "memberships" ("user_id" uuid not null, "group_id" uuid not null, "last_seen_at" timestamptz not null, constraint "memberships_pkey" primary key ("user_id", "group_id"));`);

    this.addSql(`alter table "memberships" add constraint "memberships_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`);
    this.addSql(`alter table "memberships" add constraint "memberships_group_id_foreign" foreign key ("group_id") references "groups" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "memberships" drop constraint "memberships_group_id_foreign";`);

    this.addSql(`alter table "memberships" drop constraint "memberships_user_id_foreign";`);

    this.addSql(`drop table if exists "groups" cascade;`);

    this.addSql(`drop table if exists "users" cascade;`);

    this.addSql(`drop table if exists "memberships" cascade;`);
  }

}
