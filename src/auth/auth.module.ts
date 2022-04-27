import { JwtToken, JwtTokenSchema } from './jwt.token.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from './../users/users.module';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtConfigFactory } from 'src/config/jwt.config';
import { JwtTokenService } from './jwt.token.service';

@Module({
    imports: [
        UsersModule,
        ConfigModule.forFeature(JwtConfigFactory),
        MongooseModule.forFeatureAsync([
            {
                name: JwtToken.name,
                useFactory: () => JwtTokenSchema
            }
        ]),
        PassportModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({
                defaultStrategy: config.get<string>('jwt.strategy')
            }),
            inject: [ConfigService]
        }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({
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
