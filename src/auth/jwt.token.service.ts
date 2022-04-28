import { ConfigService } from '@nestjs/config';
import { from, Observable, of, concatMap, forkJoin, map, catchError } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
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
            catchError(() => of(null))
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
            catchError(() => of(null))
        );
    }

    removeRefreshToken(refreshToken: string): Observable<any> {
        return from(this._jwtToken.deleteOne({ refreshToken })).pipe(
            catchError(() => of(null))
        );
    }

    findRefreshToken(refreshToken: string): Observable<JwtToken> {
        return from(this._jwtToken.findOne({ refreshToken })).pipe(
            catchError(() => of(null))
        );
    }

    validateRefreshToken(refreshToken: string): Observable<any> {
        return from(this._jwt.verifyAsync(refreshToken, { secret: this._config.get<string>('jwt.refreshSecret') })).pipe(
            catchError(() => of(null))
        );
    }
}
