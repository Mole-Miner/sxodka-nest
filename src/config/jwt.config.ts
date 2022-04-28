import { registerAs } from '@nestjs/config';

export const JwtConfigFactory = registerAs('jwt', async () => ({
  algorithm: process.env.JWT_ALGORITHM,
  strategy: process.env.JWT_STRATEGY,
  secret: process.env.JWT_SECRET,
  secretExpiresIn: process.env.JWT_SECRET_EXPIRES_IN,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshSecretExpiresIn: process.env.JWT_REFRESH_SECRET_EXPIRES_IN,
}));