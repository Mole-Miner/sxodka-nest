import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { MongoConfigFactory } from './config/mongo.config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { CryptoModule } from './crypto/crypto.module';
import { AbilityModule } from './ability/ability.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    RoleModule,
    AbilityModule,
    CryptoModule,
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      load: [MongoConfigFactory]
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('mongo.uri'),
      }),
    })
  ]
})
export class AppModule { }
