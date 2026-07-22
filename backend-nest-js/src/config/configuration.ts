import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  DATABASE_URL: Joi.string().uri().required(),

  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('1d'),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  AI_PROVIDER_API_KEY: Joi.string().allow('').default(''),
  AI_PROVIDER_BASE_URL: Joi.string().uri().allow('').default(''),
  AI_PROVIDER_MODEL: Joi.string().allow('').default('gpt-4o-mini'),

  STORAGE_DRIVER: Joi.string().valid('local', 's3').default('local'),
  STORAGE_LOCAL_PATH: Joi.string().default('./uploads'),
  STORAGE_S3_BUCKET: Joi.string().allow('').default(''),
});

export interface AppConfig {
  env: string;
  port: number;
  database: {
    url: string;
  };
  jwt: {
    accessSecret: string;
    accessExpiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  ai: {
    apiKey: string;
    baseUrl: string;
    model: string;
  };
  storage: {
    driver: 'local' | 's3';
    localPath: string;
    s3Bucket: string;
  };
}

export default (): AppConfig => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    url: process.env.DATABASE_URL as string,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  ai: {
    apiKey: process.env.AI_PROVIDER_API_KEY ?? '',
    baseUrl: process.env.AI_PROVIDER_BASE_URL ?? '',
    model: process.env.AI_PROVIDER_MODEL ?? 'gpt-4o-mini',
  },
  storage: {
    driver: (process.env.STORAGE_DRIVER as 'local' | 's3') ?? 'local',
    localPath: process.env.STORAGE_LOCAL_PATH ?? './uploads',
    s3Bucket: process.env.STORAGE_S3_BUCKET ?? '',
  },
});
