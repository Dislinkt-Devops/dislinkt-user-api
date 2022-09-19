import {
    IsNotEmpty, IsEmail, MinLength,
    IsString, MaxLength
} from 'class-validator'

export class UpdateFormDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    username: string;

    @IsEmail()
    email: string;
}