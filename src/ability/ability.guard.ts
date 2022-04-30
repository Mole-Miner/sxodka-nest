import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { iif, map, Observable, tap, catchError, throwError, from, switchMap } from 'rxjs';
import { ForbiddenError } from '@casl/ability';

import { AbilityFactory } from './ability.factory';
import { CHECK_ABILITY, RequiredRule } from './ability.decorator';

@Injectable()
export class AbilityGuard implements CanActivate {
    constructor(private readonly _reflrector: Reflector, private readonly _casl: AbilityFactory) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const rules = this._reflrector.get<RequiredRule[]>(CHECK_ABILITY, context.getHandler()) ?? [];
        const { user } = context.switchToHttp().getRequest();
        return iif(() => !!rules.length && !!user,
            this._casl.defineAbility(user).pipe(
                switchMap((ability) => from(rules).pipe(
                    tap(({ action, subject }) => ForbiddenError.from(ability).throwUnlessCan(action, subject))
                ))
            ),
            throwError(() => new ForbiddenException())
        ).pipe(
            map(() => true),
            catchError((e) => throwError(() => new ForbiddenException(e.message)))
        );
    }
}