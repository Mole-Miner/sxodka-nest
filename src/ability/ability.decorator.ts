import { SetMetadata } from '@nestjs/common';
import { User } from '../user/user.schema';
import { Action, Subjects } from './ability.factory';

export interface RequiredRule {
    action: Action;
    subject: Subjects;
}

export const CHECK_ABILITY = 'check_ability';

export const CheckAbility = (...requirements: RequiredRule[]) => SetMetadata(CHECK_ABILITY, requirements);

export class ReadUserAbility implements RequiredRule {
    action: Action = Action.Read;
    subject: Subjects = User;
}

export class CreateUserAbility implements RequiredRule {
    action: Action = Action.Create;
    subject: Subjects = User;
}

export class UpdateUserAbility implements RequiredRule {
    action: Action = Action.Update;
    subject: Subjects = User;
}

export class DeleteUserAbility implements RequiredRule {
    action: Action = Action.Delete;
    subject: Subjects = User;
}