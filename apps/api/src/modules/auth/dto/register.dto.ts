import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Miloš',
    description: 'Ime korisnika',
  })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({
    example: 'Dimitrijević',
    description: 'Prezime korisnika',
  })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({
    example: 'milos@gmail.com',
    description: 'Email adresa korisnika',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Lozinka123',
    description: 'Lozinka mora imati najmanje 8 karaktera',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;
}