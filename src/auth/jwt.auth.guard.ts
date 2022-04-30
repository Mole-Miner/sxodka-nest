import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable, of, switchMap, throwError, map, catchError, iif } from 'rxjs';

import { JwtTokenService } from './jwt.token.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly _jwtToken: JwtTokenService) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();
        return iif(() => !!req,
            of(req).pipe(
                switchMap((req) => {
                    const authHeader = req.headers.authorization as string;
                    const baerer = authHeader.split(' ')[0];
                    const accessToken = authHeader.split(' ')[1];
                    return iif(() => baerer === 'Bearer' && !!accessToken,
                        this._jwtToken.validateAccessToken(accessToken).pipe(
                            map((payload) => {
                                req.user = payload;
                                return !!req.user;
                            })
                        ),
                        of(false)
                    )
                })
            ),
            of(false)
        ).pipe(
            catchError(() => throwError(() => new UnauthorizedException()))
        );
    }
}