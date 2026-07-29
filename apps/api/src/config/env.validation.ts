type Environment = Record<string, unknown>;

const requiredVariables = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'JWT_REFRESH_SECRET',
  'JWT_REFRESH_EXPIRES_IN',
  'PORT',
  'CORS_ORIGIN',
] as const;

export function validateEnvironment(config: Environment): Environment {
  for (const variable of requiredVariables) {
    const value = config[variable];

    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(`Missing required environment variable: ${variable}`);
    }
  }

  const port = Number(config.PORT);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return {
    ...config,
    PORT: port,
  };
}
