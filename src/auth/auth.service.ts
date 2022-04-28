import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Observable, throwError, concatMap, from, catchError, map, forkJoin } from 'rxjs';
import { compare, hash } from 'bcrypt';

import { LoginDto } from './login.dto';
import { UsersService } from './../users/users.service';
import { JwtTokenService } from './jwt.token.service';
import { SignupDto } from './signup.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly _users: UsersService,
        private readonly _jwtToken: JwtTokenService
    ) { }

    login(dto: LoginDto): Observable<any> {
        return this._users.findOneByEmail(dto.email).pipe(
            concatMap((user) => {
                if (!user) {
                    return throwError(() => new BadRequestException());
                }
                return from(compare(dto.password, user.password)).pipe(
                    concatMap((equal) => {
                        if (!equal) {
                            return throwError(() => new BadRequestException());
                        }
                        return this._jwtToken.generateTokens(dto.email, user._id).pipe(
                            concatMap((tokens) => {
                                if (!tokens) {
                                    return throwError(() => new BadRequestException());
                                }
                                return this._jwtToken.saveRefreshToken(user._id, tokens.refreshToken).pipe(
                                    map((refreshToken) => {
                                        if (!refreshToken) {
                                            return throwError(() => new BadRequestException());
                                        }
                                        return { ...tokens, userId: user._id };
                                    })
                                );
                            })
                        )
                    })
                );
            })
        )
    }

    signup(dto: SignupDto): Observable<any> {
        return this._users.findOneByEmail(dto.email).pipe(
            concatMap((user) => {
                if (user) {
                    return throwError(() => new BadRequestException());
                }
                return from(hash(dto.password, 10)).pipe(
                    concatMap((hash) => {
                        if (!hash) {
                            return throwError(() => new BadRequestException());
                        }
                        return this._users.create({ ...dto, password: hash }).pipe(
                            concatMap((created) => {
                                if (!created) {
                                    return throwError(() => new BadRequestException());
                                }
                                return this._jwtToken.generateTokens(created.email, created._id).pipe(
                                    concatMap((tokens) => {
                                        if (!tokens) {
                                            return throwError(() => new BadRequestException());
                                        }
                                        return this._jwtToken.saveRefreshToken(created._id, tokens.refreshToken).pipe(
                                            map(() => ({ ...tokens, userId: created._id }))
                                        );
                                    })
                                );
                            })
                        )
                    })
                )
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
                            concatMap((tokens) => this._jwtToken.saveRefreshToken(user._id, tokens.refreshToken).pipe(
                                map(() => {
                                    const { _id, email, firstname, lastname } = user;
                                    return { ...tokens, _id, email, firstname, lastname };
                                })
                            ))
                        )
                    })
                )
            }),
            catchError((e) => throwError(() => new InternalServerErrorException(e)))
        );
    }

    logout(refreshToken: string): Observable<any> {
        return this._jwtToken.removeRefreshToken(refreshToken).pipe(
            catchError((e) => throwError(() => new InternalServerErrorException(e)))
        );
    }
}
