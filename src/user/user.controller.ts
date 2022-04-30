import { catchError, Observable, throwError } from 'rxjs';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { UserService } from './user.service';
import { User } from './user.schema';
import { CreateUserDto } from './user.create.dto';
import { UpdateUserDto } from './user.update.dto';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { CheckAbility, ReadUserAbility } from '../ability/ability.decorator';
import { AbilityGuard } from '../ability/ability.guard';
import { CreateUserAbility, UpdateUserAbility, DeleteUserAbility } from '../ability/ability.decorator';

@UseGuards(JwtAuthGuard, AbilityGuard)
@Controller('user')
export class UserController {
    constructor(private readonly _user: UserService) { }

    @Get()
    @CheckAbility(new ReadUserAbility())
    findAll(): Observable<User[]> {
        return this._user.findAll().pipe(
            catchError((e) => throwError(() => e))
        );
    }

    @Get(':id')
    @CheckAbility(new ReadUserAbility())
    findById(@Param('id') id: string): Observable<User> {
        return this._user.findById(id).pipe(
            catchError((e) => throwError(() => e))
        );
    }

    @Post()
    @CheckAbility(new CreateUserAbility())
    create(@Body() dto: CreateUserDto): Observable<User> {
        return this._user.create(dto).pipe(
            catchError((e) => throwError(() => e))
        );
    }

    @Patch(':id')
    @CheckAbility(new UpdateUserAbility())
    findByIdAndUpdate(@Param('id') id: string, @Body() dto: UpdateUserDto): Observable<User> {
        return this._user.findByIdAndUpdate(id, dto).pipe(
            catchError((e) => throwError(() => e))
        );
    }

    @Delete(':id')
    @CheckAbility(new DeleteUserAbility())
    findByIdAndRemove(@Param('id') id: string): Observable<User> {
        return this._user.findByIdAndRemove(id).pipe(
            catchError((e) => throwError(() => e))
        );
    }
}
