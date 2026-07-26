import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateUserDto {
@ApiProperty({
  example: 'Milos',
  description: 'User first name',
})
@IsString()
@IsNotEmpty()
firstName!: string;

 @ApiProperty({
  example: 'Dimitrijevic',
  description: 'User last name',
})
@IsString()
@IsNotEmpty()
lastName!: string;

 @ApiProperty({
  example: 'milos@gmail.com',
  description: 'User email address',
})
@IsEmail()
email!: string;

 @ApiProperty({
  example: 'Password123',
  description: 'User password (minimum 6 characters)',
})
@IsString()
@MinLength(6)
password!: string;
}