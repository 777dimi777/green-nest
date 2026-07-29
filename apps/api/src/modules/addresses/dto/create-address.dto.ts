import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({
    example: 'Miloš',
    description: 'Ime osobe koja preuzima porudžbinu.',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @ApiProperty({
    example: 'Dimitrijević',
    description: 'Prezime osobe koja preuzima porudžbinu.',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName!: string;

  @ApiProperty({
    example: '+381641234567',
    description: 'Kontakt telefon primaoca.',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(30)
  phone!: string;

  @ApiProperty({
    example: 'Srbija',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  country!: string;

  @ApiProperty({
    example: 'Bor',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  city!: string;

  @ApiProperty({
    example: '19210',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(15)
  postalCode!: string;

  @ApiProperty({
    example: 'Nikole Pašića',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  street!: string;

  @ApiProperty({
    example: '15',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  streetNumber!: string;

  @ApiPropertyOptional({
    example: '12',
    description: 'Broj stana, ulaza ili dodatna oznaka.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  apartment?: string;

  @ApiPropertyOptional({
    example: false,
    default: false,
    description: 'Da li je ovo podrazumevana adresa korisnika.',
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
