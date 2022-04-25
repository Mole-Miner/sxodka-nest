import { Injectable } from '@nestjs/common';

export type User = {
    id: number;
    name: string;
    username: string;
    password: string;
}

@Injectable()
export class UsersService {
    private readonly _users: User[] = [
        {
            id: 1,
            name: 'Vlad',
            username: 'Vladysalve',
            password: 'qwrety123'
        },
        {
            id: 2,
            name: 'Android',
            username: 'Andrey',
            password: 'qwrety123'
        }
    ]

    async findOne(username: string): Promise<User | undefined> {
        return this._users.find(user => user.username === username);
    }
}
