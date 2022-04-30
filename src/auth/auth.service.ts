import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable, throwError, switchMap, from, map, forkJoin, catchError } from 'rxjs';

import { LoginDto } from './login.dto';
import { SignupDto } from './signup.dto';
import { UserService } from '../user/user.service';
import { JwtTokenService } from './jwt.token.service';
import { CryptoService } from '../crypto/crypto.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly _user: UserService,
        private readonly _jwtToken: JwtTokenService,
        private readonly _crypto: CryptoService
    ) { }

    login({ email, password }: LoginDto): Observable<any> {
        return this._user.findOneByEmail(email).pipe(
            switchMap((user) => {
                if (!user) {
                    return throwError(() => new BadRequestException('User with provided email does not exist'));
                }
                return this._crypto.compare(password, user.password).pipe(
                    switchMap((equal) => {
                        if (!equal) {
                            return throwError(() => new BadRequestException('Wrong password'))
                        }
                        return this._jwtToken.generateTokens(email, user._id, user.isAdmin).pipe(
                            switchMap(({ accessToken, refreshToken }) => this._jwtToken.saveRefreshToken(user._id, refreshToken).pipe(
                                map(({ userId }) => ({ accessToken, refreshToken, userId }))
                            ))
                        );
                    })
                );
            }),
            catchError((e) => throwError(() => e))
        );
    }

    signup({ email, password, firstname, lastname }: SignupDto): Observable<any> {
        return this._user.findOneByEmail(email).pipe(
            switchMap((user) => {
                if (user) {
                    return throwError(() => new BadRequestException('User with provided email already exists'))
                }
                return from(this._crypto.genSalt().pipe(
                    switchMap((salt) => this._crypto.hash(password, salt).pipe(
                        switchMap((passwordHash) => this._user.create({ email, firstname, lastname, password: passwordHash, isAdmin: true }).pipe(
                            switchMap((created) => this._jwtToken.generateTokens(created.email, created._id, created.isAdmin).pipe(
                                switchMap(({ accessToken, refreshToken }) => this._jwtToken.saveRefreshToken(created._id, refreshToken).pipe(
                                    map(({ userId }) => ({ accessToken, refreshToken, userId }))
                                ))
                            ))
                        ))
                    ))
                ))
            }),
            catchError((e) => throwError(() => e))
        );
    }

    refresh(refreshToken: string): Observable<any> {
        return forkJoin([
            this._jwtToken.validateRefreshToken(refreshToken),
            this._jwtToken.findRefreshToken(refreshToken)
        ]).pipe(
            switchMap(([payload, token]) => {
                if (!payload || !token) {
                    return throwError(() => new UnauthorizedException());
                }
                return this._user.findById(token.userId).pipe(
                    switchMap((user) => {
                        if (!user) {
                            return throwError(() => new UnauthorizedException());
                        }
                        return this._jwtToken.generateTokens(user.email, user._id, user.isAdmin).pipe(
                            switchMap(({ accessToken, refreshToken }) => this._jwtToken.saveRefreshToken(user._id, refreshToken).pipe(
                                map(({ userId }) => ({ accessToken, refreshToken, userId }))
                            ))
                        );
                    })
                )
            }),
            catchError((e) => throwError(() => e))
        );
    }

    logout(refreshToken: string): Observable<any> {
        return this._jwtToken.removeRefreshToken(refreshToken).pipe(
            catchError((e) => throwError(() => e))
        );
    }
}
