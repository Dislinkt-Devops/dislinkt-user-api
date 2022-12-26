import {
    IsNotEmpty, IsEmail, MinLength,
    IsString, MaxLength, Matches
} from 'class-validator'
import { Match } from '../../common';

export class RegistrationDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(4)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'password too weak'})
    password: string;

    @IsString()
    @Match('password', {message: 'Passwords are not matching'})
    passwordConfirm: string;
}