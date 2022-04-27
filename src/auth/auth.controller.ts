import { Observable, of } from 'rxjs';
import { Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly _auth: AuthService) { }

    @Post('login')
    login(): Observable<any> {
        return of('login');
    }
}
