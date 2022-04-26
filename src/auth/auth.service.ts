import { UsersService } from './../users/users.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { map, Observable, of, } from 'rxjs';
import { User } from 'src/users/user.schema';

@Injectable()
export class AuthService {
    constructor(private readonly _users: UsersService, private readonly _jwt: JwtService) { }

    validateUser(email: string, password: string): Observable<any> {
        return this._users.findOneByEmail(email).pipe(
            map((user: User) => {
                if (user && user.password === password) {
                    const { _id, email, firstname, lastname } = user;
                    return { _id, email, firstname, lastname };
                }
                return null;
            })
        );
    }

    login(user: any): Observable<{ access_token: string }> {
        const payload = { email: user.email, sub: user._id };
        return of({ access_token: this._jwt.sign(payload) });
    }
}
