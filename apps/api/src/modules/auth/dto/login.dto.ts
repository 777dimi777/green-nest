import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'milos@gmail.com',
    description: 'Email adresa korisnika',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Lozinka123',
    description: 'Lozinka korisnika',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
