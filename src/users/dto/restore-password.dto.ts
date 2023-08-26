import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class restorePasswordRequestDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;
}

export class restorePasswordDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;
    
    @IsNotEmpty()
    @IsString()
    @Length(8, 1000, { message: 'Password must be at least 8 symbols long' })
    password: string;
}