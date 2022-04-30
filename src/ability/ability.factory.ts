import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects } from "@casl/ability";
import { Injectable } from "@nestjs/common";
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
    defineAbility(user: User) {
        const { can, cannot, build } = new AbilityBuilder(Ability as AbilityClass<AppAbility>);
        if (user.isAdmin) {
            can(Action.Manage, User);
        } else {
            can(Action.Read, 'all'),
            cannot(Action.Create, User).because('You are not admin');
        }
        return build({ detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects> });
    }
}
