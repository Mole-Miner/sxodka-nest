import { registerAs } from '@nestjs/config';

export const JwtConfigFactory = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET
}));