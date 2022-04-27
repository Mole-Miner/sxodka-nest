import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
                            concatMap((tokens) => this._jwtToken.saveRefreshToken(user._id, tokens.refreshToken).pipe(
                                map(() => {
                                    const { password, ...rest } = user;
                                    return { ...tokens, rest };
                                })
                            ))
                        )
                    })
                );
            }),
            catchError((e) => throwError(() => new InternalServerErrorException(e)))
        )
    }

    signup(dto: SignupDto): Observable<any> {
        return this._users.findOneByEmail(dto.email).pipe(
            concatMap((user) => {
                if (user) {
                    return throwError(() => new BadRequestException());
                }
                return from(hash(dto.password, 10)).pipe(
                    concatMap((hash) => this._users.create({ ...dto, password: hash }).pipe(
                        concatMap((created) => this._jwtToken.generateTokens(created.email, created._id).pipe(
                            concatMap((tokens) => this._jwtToken.saveRefreshToken(created._id, tokens.refreshToken).pipe(
                                map(() => {
                                    const { password, ...rest } = created;
                                    return { ...tokens, rest };
                                })
                            ))
                        ))
                    ))
                )
            }),
            catchError((e) => throwError(() => new InternalServerErrorException(e)))
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
                                    const { password, ...rest } = user;
                                    return { ...tokens, rest };
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
