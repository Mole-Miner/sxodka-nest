import { catchError, Observable, throwError } from 'rxjs';
import { Body, Controller, Delete, Get, InternalServerErrorException, Param, Post, Put } from '@nestjs/common';

import { UsersService } from './users.service';
import { User } from './user.schema';

@Controller('users')
export class UsersController {
    constructor(private readonly _users: UsersService) { }

    @Get()
    findAll(): Observable<User[]> {
        return this._users.findAll().pipe(
            catchError((e) => throwError(() => new InternalServerErrorException(e)))
        );
    }

    @Get(':id')
    findById(@Param('id') id: string): Observable<User> {
        return this._users.findById(id).pipe(
            catchError((e) => throwError(() => new InternalServerErrorException(e)))
        );
    }

    @Post()
    create(@Body() dto: any): Observable<User> {
        return this._users.create(dto).pipe(
            catchError((e) => throwError(() => new InternalServerErrorException(e)))
        );
    }

    @Put()
    findByIdAndUpdate(id: string, dto: any): Observable<User> {
        return this._users.findByIdAndUpdate(id, dto).pipe(
            catchError((e) => throwError(() => new InternalServerErrorException(e)))
        );
    }

    @Delete()
    findByIdAndRemove(id: string): Observable<User> {
        return this._users.findByIdAndRemove(id).pipe(
            catchError((e) => throwError(() => new InternalServerErrorException(e)))
        );
    }
}
