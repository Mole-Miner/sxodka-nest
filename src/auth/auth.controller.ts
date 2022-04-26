import { Observable } from 'rxjs';
import { Controller, Post, UseGuards, Request } from '@nestjs/common';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local.auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly _auth: AuthService) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    login(@Request() req): Observable<any> {
        return this._auth.login(req.user);
    }
}
