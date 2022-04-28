import { ConfigService } from '@nestjs/config';
import { from, Observable, concatMap, forkJoin, map, catchError, throwError } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';

import { JwtToken, JwtTokenDocument } from './jwt.token.schema';

@Injectable()
export class JwtTokenService {
    constructor(
        @InjectModel(JwtToken.name) private readonly _jwtToken: Model<JwtTokenDocument>,
        private readonly _jwt: JwtService,
        private readonly _config: ConfigService
    ) { }

    generateTokens(email: string, id: string): Observable<{ accessToken: string, refreshToken: string }> {
        return forkJoin([
            from(this._jwt.signAsync(
                { email, sub: id },
                { expiresIn: this._config.get<string>('jwt.secretExpiresIn') }
            )),
            from(this._jwt.signAsync(
                { email, sub: id },
                {
                    secret: this._config.get<string>('jwt.refreshSecret'),
                    expiresIn: this._config.get<string>('jwt.refreshSecretExpiresIn')
                }
            ))
        ]).pipe(
            map(([accessToken, refreshToken]) => ({ accessToken, refreshToken })),
            catchError((e) => throwError(() => new InternalServerErrorException(e)))
        );
    }

    saveRefreshToken(userId: string, refreshToken: string): Observable<JwtToken> {
        return from(this._jwtToken.findOne({ userId })).pipe(
            concatMap((token) => {
                if (token) {
                    token.refreshToken = refreshToken;
                    return from(token.save());
                }
                return from(this._jwtToken.create({ userId, refreshToken }));
            }),
            catchError((e) => throwError(() => new InternalServerErrorException(e)))
        );
    }

    removeRefreshToken(refreshToken: string): Observable<any> {
        return from(this._jwtToken.deleteOne({ refreshToken })).pipe(
            catchError((e) => throwError(() => new InternalServerErrorException(e)))
        );
    }

    findRefreshToken(refreshToken: string): Observable<JwtToken> {
        return from(this._jwtToken.findOne({ refreshToken })).pipe(
            catchError((e) => throwError(() => new InternalServerErrorException(e)))
        );
    }

    validateRefreshToken(refreshToken: string): Observable<any> {
        return from(this._jwt.verifyAsync(refreshToken, { secret: this._config.get<string>('jwt.refreshSecret') })).pipe(
            catchError((e) => throwError(() => new InternalServerErrorException(e)))
        );
    }
}
