import { IsString, Matches, MinLength } from 'class-validator'
import { Match } from '../../common';

export class PasswordChangeDto {

    @IsString()
    @MinLength(4)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'password too weak'})
    password: string;

    @IsString()
    @Match('password', {message: 'Passwords are not matching'})
    passwordConfirm: string;
}