import { Observable } from 'rxjs';
import { UsersService } from './users.service';
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { User } from './user.schema';

@Controller('users')
export class UsersController {
    constructor(private readonly _users: UsersService) { }

    @Get()
    findAll(): Observable<User[]> {
        return this._users.findAll();
    }

    @Get(':id')
    findById(@Param('id') id: string): Observable<User> {
        return this._users.findById(id);
    }

    @Post()
    create(@Body() dto: any): Observable<User> {
        return this._users.create(dto);
    }

    @Put()
    findByIdAndUpdate(id: string, dto: any): Observable<User> {
        return this._users.findByIdAndUpdate(id, dto);
    }

    @Delete()
    findByIdAndRemove(id: string): Observable<User> {
        return this._users.findByIdAndRemove(id);
    }
}
