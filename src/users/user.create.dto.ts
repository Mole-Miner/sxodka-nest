import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(20)
    readonly firstname!: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(20)
    readonly lastname!: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @MaxLength(30)
    readonly email!: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(30)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'password too weak' })
    readonly password!: string;
}