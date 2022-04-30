import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable, throwError, concatMap, from, map, forkJoin } from 'rxjs';

import { LoginDto } from './login.dto';
import { SignupDto } from './signup.dto';
import { UsersService } from './../users/users.service';
import { JwtTokenService } from './jwt.token.service';
import { CryptoService } from '../crypto/crypto.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly _users: UsersService,
        private readonly _jwtToken: JwtTokenService,
        private readonly _crypto: CryptoService
    ) { }

    login({ email, password }: LoginDto): Observable<any> {
        return this._users.findOneByEmail(email).pipe(
            concatMap((user) => {
                if (!user) {
                    return throwError(() => new BadRequestException('User with provided email does not exist'));
                }
                return this._crypto.compare(password, user.password).pipe(
                    concatMap((equal) => {
                        if (!equal) {
                            return throwError(() => new BadRequestException('Wrong password'))
                        }
                        return this._jwtToken.generateTokens(email, user._id).pipe(
                            concatMap(({ accessToken, refreshToken }) => this._jwtToken.saveRefreshToken(user._id, refreshToken).pipe(
                                map(({ userId }) => ({ accessToken, refreshToken, userId }))
                            ))
                        );
                    })
                );
            })
        );
    }

    signup({ email, password, firstname, lastname }: SignupDto): Observable<any> {
        return this._users.findOneByEmail(email).pipe(
            concatMap((user) => {
                if (user) {
                    return throwError(() => new BadRequestException('User with provided email already exists'))
                }
                return from(this._crypto.genSalt().pipe(
                    concatMap((salt) => this._crypto.hash(password, salt).pipe(
                        concatMap((passwordHash) => this._users.create({ email, firstname, lastname, password: passwordHash }).pipe(
                            concatMap((created) => this._jwtToken.generateTokens(created.email, created._id).pipe(
                                concatMap(({ accessToken, refreshToken }) => this._jwtToken.saveRefreshToken(created._id, refreshToken).pipe(
                                    map(({ userId }) => ({ accessToken, refreshToken, userId }))
                                ))
                            ))
                        ))
                    ))
                ))
            })
        );
    }

    refresh(refreshToken: string): Observable<any> {
        return forkJoin([
            this._jwtToken.validateRefreshToken(refreshToken),
            this._jwtToken.findRefreshToken(refreshToken)
        ]).pipe(
            concatMap(([payload, token]) => {
                if (!payload || !token) {
                    return throwError(() => new UnauthorizedException());
                }
                return this._users.findById(token.userId).pipe(
                    concatMap((user) => {
                        if (!user) {
                            return throwError(() => new UnauthorizedException());
                        }
                        return this._jwtToken.generateTokens(user.email, user._id).pipe(
                            concatMap(({ accessToken, refreshToken }) => this._jwtToken.saveRefreshToken(user._id, refreshToken).pipe(
                                map(({ userId }) => ({ accessToken, refreshToken, userId }))
                            ))
                        );
                    })
                )
            })
        );
    }

    logout(refreshToken: string): Observable<any> {
        return this._jwtToken.removeRefreshToken(refreshToken);
    }
}
