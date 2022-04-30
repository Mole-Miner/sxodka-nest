import { MongooseModule } from '@nestjs/mongoose';
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from './../users/users.module';
import { JwtToken, JwtTokenSchema } from './jwt.token.schema';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtConfigFactory } from '../config/jwt.config';
import { JwtTokenService } from './jwt.token.service';
import { CryptoModule } from './../crypto/crypto.module';

@Module({
    imports: [
        forwardRef(async () => UsersModule),
        CryptoModule,
        ConfigModule.forFeature(JwtConfigFactory),
        MongooseModule.forFeatureAsync([
            {
                name: JwtToken.name,
                useFactory: async () => JwtTokenSchema
            }
        ]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({
                verifyOptions: {
                    ignoreExpiration: false,
                    algorithms: [config.get<any>('jwt.algorithm')]
                }
            }),
            inject: [ConfigService],
        })
    ],
    providers: [
        AuthService,
        JwtTokenService,
    ],
    controllers: [AuthController],
    exports: [
        AuthService,
        JwtTokenService,
        JwtModule
    ]
})
export class AuthModule { }
