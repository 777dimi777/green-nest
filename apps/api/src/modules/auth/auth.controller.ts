import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registracija novog korisnika',
  })
  @ApiCreatedResponse({
    description: 'Korisnik je uspešno registrovan.',
  })
  @ApiConflictResponse({
    description: 'Korisnik sa datim emailom već postoji.',
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}