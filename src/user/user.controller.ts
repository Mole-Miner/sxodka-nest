import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { catchError, Observable, throwError } from 'rxjs';
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';

import { UserService } from './user.service';
import { User } from './user.schema';
import { CreateUserDto } from './user.create.dto';
import { UpdateUserDto } from './user.update.dto';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
    constructor(private readonly _user: UserService) { }

    @Get()
    findAll(): Observable<User[]> {
        return this._user.findAll().pipe(
            catchError((e) => throwError(() => e))
        );
    }

    @Get(':id')
    findById(@Param('id') id: string): Observable<User> {
        return this._user.findById(id).pipe(
            catchError((e) => throwError(() => e))
        );
    }

    @Post()
    create(@Body() dto: CreateUserDto): Observable<User> {
        return this._user.create(dto).pipe(
            catchError((e) => throwError(() => e))
        );
    }

    @Put(':id')
    findByIdAndUpdate(@Param('id') id: string, @Body() dto: UpdateUserDto): Observable<User> {
        return this._user.findByIdAndUpdate(id, dto).pipe(
            catchError((e) => throwError(() => e))
        );
    }

    @Delete(':id')
    findByIdAndRemove(@Param('id') id: string): Observable<User> {
        return this._user.findByIdAndRemove(id).pipe(
            catchError((e) => throwError(() => e))
        );
    }
}
