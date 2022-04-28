import { JwtToken, JwtTokenSchema } from './jwt.token.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from './../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtConfigFactory } from '../config/jwt.config';
import { JwtTokenService } from './jwt.token.service';

@Module({
    imports: [
        forwardRef(() => UsersModule),
        ConfigModule.forFeature(JwtConfigFactory),
        MongooseModule.forFeatureAsync([
            {
                name: JwtToken.name,
                useFactory: () => JwtTokenSchema
            }
        ]),
        PassportModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                session: false,
                defaultStrategy: config.get<string>('jwt.strategy')
            }),
            inject: [ConfigService]
        }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('jwt.secret'),
            }),
            inject: [ConfigService],
        })
    ],
    providers: [
        AuthService,
        JwtStrategy,
        JwtTokenService
    ],
    exports: [AuthService, PassportModule, JwtModule],
    controllers: [AuthController]
})
export class AuthModule { }
