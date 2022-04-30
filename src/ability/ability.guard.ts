import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ForbiddenError } from '@casl/ability';

import { AbilityFactory } from './ability.factory';
import { CHECK_ABILITY, RequiredRule } from './ability.decoretor';

@Injectable()
export class AbilityGuard implements CanActivate {
    constructor(private readonly _reflrector: Reflector, private readonly _casl: AbilityFactory) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const rules = this._reflrector.get<RequiredRule[]>(CHECK_ABILITY, context.getHandler()) ?? [];
        const { user } = context.switchToHttp().getRequest();
        const ability = this._casl.defineAbility(user);
        console.log(rules, user);
        try {
            rules.forEach((rule) => ForbiddenError.from(ability).throwUnlessCan(rule.aciton, rule.subject));
            return true;
        } catch (error) {
            if (error instanceof ForbiddenError) {
                throw new ForbiddenException(error.message);
            }
            throw error;
        }
    }
}