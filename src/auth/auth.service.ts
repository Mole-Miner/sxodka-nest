import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Observable, throwError, concatMap, from, catchError, map } from 'rxjs';
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
        return from(this._users.findOneByEmail(dto.email)).pipe(
            concatMap((user) => {
                if (!user) {
                    return throwError(() => new BadRequestException());
                }
                return from(compare(dto.password, user.password)).pipe(
                    concatMap((equal) => {
                        if (!equal) {
                            return throwError(() => new BadRequestException());
                        }
                        return from(this._jwtToken.generateTokens(dto.email, user._id)).pipe(
                            concatMap((tokens) => from(this._jwtToken.saveRefreshToken(user._id, tokens.refreshToken)).pipe(
                                map(() => ({ ...tokens, user }))
                            ))
                        )
                    })
                );
            }),
            catchError((e) => throwError(() => new InternalServerErrorException(e)))
        )
    }

    signup(dto: SignupDto): Observable<any> {
        return from(this._users.findOneByEmail(dto.email)).pipe(
            concatMap((user) => {
                if (user) {
                    return throwError(() => new BadRequestException());
                }

            })
        )
    }
}
