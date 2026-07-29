import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'Lozinka123',
    description: 'Trenutna lozinka korisnika',
  })
  @IsString()
  @MinLength(8)
  currentPassword!: string;

  @ApiProperty({
    example: 'NovaLozinka123',
    description: 'Nova lozinka korisnika',
  })
  @IsString()
  @MinLength(8)
  newPassword!: string;

  @ApiProperty({
    example: 'NovaLozinka123',
    description: 'Potvrda nove lozinke',
  })
  @IsString()
  @MinLength(8)
  confirmPassword!: string;
}
