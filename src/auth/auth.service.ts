import { UsersService } from './../users/users.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
    constructor(private readonly _users: UsersService, private readonly _jwt: JwtService) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await lastValueFrom(this._users.findOneByEmail(email));
        if (user && user.password === password) {
            const { password, email, ...rest } = user;
            return rest;
        }
        return null;
    }

    async login(user: any) {
        const payload = { name: user.name, sub: user.id };
        return {
            access_token: this._jwt.sign(payload)
        }
    }
}
