import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable, throwError, concatMap, from, map, forkJoin, catchError } from 'rxjs';
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
                    return throwError(() => new BadRequestException('User with provided email does not exist'));
                }
                return from(compare(dto.password, user.password)).pipe(
                    concatMap((equal) => {
                        if (!equal) {
                            return throwError(() => new BadRequestException('Wrong password'))
                        }
                        return this._jwtToken.generateTokens(dto.email, user._id).pipe(
                            concatMap((tokens) => this._jwtToken.saveRefreshToken(user._id, tokens.refreshToken).pipe(
                                map((refreshToken) => ({ ...tokens, userId: refreshToken.userId }))
                            ))
                        );
                    })
                );
            }),
            catchError((e) => throwError(() => e))
        );
    }

    signup(dto: SignupDto): Observable<any> {
        return this._users.findOneByEmail(dto.email).pipe(
            concatMap((user) => {
                if (user) {
                    return throwError(() => new BadRequestException('User with provided email already exists'));
                }
                return from(hash(dto.password, 10)).pipe(
                    concatMap((hash) => this._users.create({ ...dto, password: hash }).pipe(
                        concatMap((created) => this._jwtToken.generateTokens(created.email, created._id).pipe(
                            concatMap((tokens) => this._jwtToken.saveRefreshToken(created._id, tokens.refreshToken).pipe(
                                map((refreshToken) => ({ ...tokens, userId: refreshToken.userId }))
                            ))
                        ))
                    ))
                )
            }),
            catchError((e) => throwError(() => e))
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
                                map((refreshToken) => ({ ...tokens, userId: refreshToken.userId }))
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
