import { Migration } from '@mikro-orm/migrations';

export class Migration20250401085140 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "groups" ("id" uuid not null, "group_name" varchar(255) not null, "logo_image" varchar(255) null, constraint "groups_pkey" primary key ("id"));`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "groups" cascade;`);
  }

}
