import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

// export class LoginDto {
//     @IsNotEmpty()
//     @IsString()
//     @IsEmail()
//     @MaxLength(30)
//     readonly email!: string;

//     @IsNotEmpty()
//     @IsString()
//     @MinLength(8)
//     @MaxLength(30)
//     @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'password too weak' })
//     readonly password!: string;
// }

export class LoginDto {
    email!: string;
    password!: string;
}