import { Observable, of, switchMap } from 'rxjs';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Role } from './role.enum';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly _reflector: Reflector) {}

  canActivate(context: ExecutionContext): Observable<boolean> {
    const requiredRoles = this._reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    return of(requiredRoles).pipe(
        switchMap((roles) => {
            if (!roles) {
                return of(true);
            }
            const { user } = context.switchToHttp().getRequest();
            return of(roles.some((role) => user.roles?.includes(role)));
        })
    );
  }
}