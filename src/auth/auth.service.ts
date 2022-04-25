import { UsersService } from './../users/users.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private readonly _users: UsersService, private readonly _jwt: JwtService) { }

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this._users.findOne(username);
        if (user && user.password === password) {
            const { password, username, ...rest } = user;
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
