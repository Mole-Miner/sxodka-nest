import { registerAs } from '@nestjs/config';

export const ThrottlerConfigFactory = registerAs('throttler', async () => ({
    ttl: process.env.THROTTLER_TTL,
    limit: process.env.THROTTLER_LIMIT
}));