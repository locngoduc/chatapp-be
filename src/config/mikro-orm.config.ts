import { Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { config } from 'dotenv';

config();
const env = process.env;

const ormConfig: Options = {
  entities: ['./dist/src/modules/**/entities/*.entity.ts'],
  entitiesTs: ['./src/modules/**/entities/*.entity.ts'],
  extensions: [Migrator],
  clientUrl: `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`,
  baseDir: process.cwd(),
  driver: PostgreSqlDriver,
  metadataProvider: TsMorphMetadataProvider,
  debug: true,
};

export default ormConfig;
