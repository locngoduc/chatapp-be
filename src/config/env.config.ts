import { z } from 'zod';

export const envConfig = z.object({
  APP_PORT: z.coerce.number().default(3000),
  INSTANCE_NAME: z.string().nonempty(),
  POSTGRES_USER: z.string().nonempty(),
  POSTGRES_PASSWORD: z.string().nonempty(),
  POSTGRES_HOST: z.string().nonempty(),
  POSTGRES_PORT: z.string().nonempty(),
  POSTGRES_DB: z.string().nonempty(),
  REDIS_PORT: z.coerce.number(),
  REDIS_HOST: z.string().nonempty(),
  REDIS_PASSWORD: z.string().nonempty(),
  SESSION_SECRET: z.string().nonempty(),
  CLOUDINARY_NAME: z.string().nonempty(),
  CLOUDINARY_API_KEY: z.string().nonempty(),
  CLOUDINARY_API_SECRET: z.string().nonempty(),
  MONGO_USER: z.string().nonempty(),
  MONGO_PASSWORD: z.string().nonempty(),
  MONGO_DB: z.string().nonempty(),
  MONGO_HOST: z.string().nonempty(),
  MONGO_PORT: z.coerce.number(),
});

export const envConfigParser = (env: Record<string, any>) => {
  const parsedEnv = envConfig.safeParse(env);
  if (!parsedEnv.success) {
    throw new Error(
      `Missing required environment variables: ${parsedEnv.error.errors.map((err) => err.path)}`,
    );
  }
  return parsedEnv.data;
};

export type EnvConfig = z.infer<typeof envConfig>;
