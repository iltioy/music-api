import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class signUpDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email must be provided' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password must be provided' })
  @Length(8, 1000, { message: 'Password must be at least 8 symbols long' })
  password: string;

  @IsString()
  @IsNotEmpty()
  emailVerificationCode: string;
}

export class signInDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email must be provided' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password must be provided' })
  @Length(8, 1000, { message: 'Password must be at least 8 symbols long' })
  password: string;
}
