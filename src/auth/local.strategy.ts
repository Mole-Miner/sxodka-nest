import { Observable, tap } from 'rxjs';
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";

import { AuthService } from "./auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly _auth: AuthService) {
        super({ usernameField: 'email' })
    }

    validate(email: string, password: string): Observable<any> {
        return this._auth.validateUser(email, password).pipe(
            tap((user) => {
                if (!user) {
                    throw new UnauthorizedException();
                }
            })
        );
    }
}