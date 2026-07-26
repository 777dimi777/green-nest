import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
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
  @Post('login')
@ApiOperation({
  summary: 'Prijava korisnika',
})
@ApiOkResponse({
  description: 'Korisnik je uspešno prijavljen.',
})
@ApiUnauthorizedResponse({
  description: 'Email ili lozinka nisu ispravni.',
})
login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
}