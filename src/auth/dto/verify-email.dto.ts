import { IsBoolean, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class verifyEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsBoolean()
  test?: boolean;
}
