import { JwtAuthGuard } from './../auth/jwt.auth.guard';
import { catchError, Observable, throwError } from 'rxjs';
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';

import { UsersService } from './users.service';
import { User } from './user.schema';
import { CreateUserDto } from './user.create.dto';
import { UpdateUserDto } from './user.update.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly _users: UsersService) { }

    @Get()
    findAll(): Observable<User[]> {
        return this._users.findAll().pipe(
            catchError((e) => throwError(() => e))
        );
    }

    @Get(':id')
    findById(@Param('id') id: string): Observable<User> {
        return this._users.findById(id).pipe(
            catchError((e) => throwError(() => e))
        );
    }

    @Post()
    create(@Body() dto: CreateUserDto): Observable<User> {
        return this._users.create(dto).pipe(
            catchError((e) => throwError(() => e))
        );
    }

    @Put(':id')
    findByIdAndUpdate(@Param('id') id: string, @Body() dto: UpdateUserDto): Observable<User> {
        return this._users.findByIdAndUpdate(id, dto).pipe(
            catchError((e) => throwError(() => e))
        );
    }

    @Delete(':id')
    findByIdAndRemove(@Param('id') id: string): Observable<User> {
        return this._users.findByIdAndRemove(id).pipe(
            catchError((e) => throwError(() => e))
        );
    }
}
