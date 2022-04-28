
import { Observable } from 'rxjs';
import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { SignupDto } from './signup.dto';
import { LoginDto } from './login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly _auth: AuthService) { }

    @Post('login')
    login(@Body() dto: LoginDto): Observable<any> {
        return this._auth.login(dto);
    }

    @Post('signup')
    singup(@Body() dto: SignupDto): Observable<any> {
        return this._auth.signup(dto);
    }

    @Post('refresh')
    refresh(@Body() token: { refreshToken: string }): Observable<any> {
        return this._auth.refresh(token.refreshToken);
    }

    @Post('logout')
    logout(@Body() token: { refreshToken: string }): Observable<any> {
        return this._auth.logout(token.refreshToken);
    }
}
