import { catchError, Observable, throwError } from 'rxjs';
import { Body, Controller, Delete, Get, InternalServerErrorException, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';

import { UsersService } from './users.service';
import { User } from './user.schema';
import { CreateUserDto } from './user.create.dto';
import { UpdateUserDto } from './user.update.dto';

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
    create(@Body() dto: CreateUserDto): Observable<User> {
        return this._users.create(dto).pipe(
            catchError((e) => throwError(() => new InternalServerErrorException(e)))
        );
    }

    @Put(':id')
    findByIdAndUpdate(@Param('id') id: string, @Body() dto: UpdateUserDto): Observable<User> {
        return this._users.findByIdAndUpdate(id, dto).pipe(
            catchError((e) => throwError(() => new InternalServerErrorException(e)))
        );
    }

    @Delete(':id')
    findByIdAndRemove(@Param('id') id: string): Observable<User> {
        return this._users.findByIdAndRemove(id).pipe(
            catchError((e) => throwError(() => new InternalServerErrorException(e)))
        );
    }
}
