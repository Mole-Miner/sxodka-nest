import { Observable, of, switchMap, catchError, throwError } from 'rxjs';
import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects } from "@casl/ability";
import { Injectable, InternalServerErrorException } from "@nestjs/common";

import { User } from "src/user/user.schema";

export enum Action {
    Manage = 'manage',
    Create = 'create',
    Read = 'read',
    Update = 'update',
    Delete = 'delete'
}

export type Subjects = InferSubjects<typeof User> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class AbilityFactory {
    defineAbility({ isAdmin }: User): Observable<AppAbility> {
        return of(new AbilityBuilder(Ability as AbilityClass<AppAbility>)).pipe(
            switchMap(({ can, cannot, build }) => {
                if (isAdmin) {
                    can(Action.Manage, User);
                } else {
                    can(Action.Read, User);
                    cannot([Action.Create, Action.Update, Action.Delete], User).because('You have no permission for managing users');
                }
                return of(build({ detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects> }))
            }),
            catchError((e) => throwError(() => new InternalServerErrorException(e)))
        );
    }
}
