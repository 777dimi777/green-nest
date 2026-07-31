type Environment = Record<string, unknown>;

const requiredVariables = [
  'NODE_ENV',
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'JWT_REFRESH_SECRET',
  'JWT_REFRESH_EXPIRES_IN',
  'PORT',
  'CORS_ORIGIN',
  'SWAGGER_ENABLED',
] as const;

export function validateEnvironment(config: Environment): Environment {
  for (const variable of requiredVariables) {
    const value = config[variable];
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(`Missing required environment variable: ${variable}`);
    }
  }

  const nodeEnv = String(config.NODE_ENV);
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error('NODE_ENV must be development, test or production');
  }

  const port = Number(config.PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  for (const variable of ['JWT_SECRET', 'JWT_REFRESH_SECRET'] as const) {
    const secret = String(config[variable]);
    if (secret.length < 32) {
      throw new Error(`${variable} must contain at least 32 characters`);
    }
    if (secret.startsWith('replace-with-')) {
      throw new Error(`${variable} must not use the example placeholder value`);
    }
  }
  if (config.JWT_SECRET === config.JWT_REFRESH_SECRET) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different');
  }

  const swaggerEnabled = String(config.SWAGGER_ENABLED).toLowerCase();
  if (!['true', 'false'].includes(swaggerEnabled)) {
    throw new Error('SWAGGER_ENABLED must be true or false');
  }

  const corsOrigins = String(config.CORS_ORIGIN)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (corsOrigins.length === 0) {
    throw new Error('CORS_ORIGIN must contain at least one absolute URL');
  }
  for (const origin of corsOrigins) {
    let url: URL;
    try {
      url = new URL(origin);
    } catch {
      throw new Error(`Invalid CORS_ORIGIN value: ${origin}`);
    }
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin) {
      throw new Error(`CORS_ORIGIN must contain origins only: ${origin}`);
    }
  }

  const databaseUrl = String(config.DATABASE_URL);
  if (
    !databaseUrl.startsWith('postgresql://') &&
    !databaseUrl.startsWith('postgres://')
  ) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection URL');
  }

  return {
    ...config,
    NODE_ENV: nodeEnv,
    PORT: port,
    SWAGGER_ENABLED: swaggerEnabled,
  };
}
