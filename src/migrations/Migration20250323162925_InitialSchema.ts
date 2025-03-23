import { Migration } from '@mikro-orm/migrations';

export class Migration20250323162925_InitialSchema extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "users" ("id" uuid not null, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "middle_name" varchar(255) null, "email" varchar(255) not null, "hashed_password" varchar(255) not null, "profile_image" varchar(255) null, "last_online_at" timestamptz not null, "is_online" boolean not null default false, constraint "users_pkey" primary key ("id"));`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "users" cascade;`);
  }

}
