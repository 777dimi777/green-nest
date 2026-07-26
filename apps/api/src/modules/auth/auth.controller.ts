import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import type { RefreshAuthenticatedUser } from './interfaces/refresh-authenticated-user.interface';
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
  @Post('refresh')
@UseGuards(JwtRefreshAuthGuard)
@HttpCode(HttpStatus.OK)
@ApiBearerAuth()
@ApiOperation({
  summary: 'Izdavanje novih access i refresh tokena',
})
@ApiOkResponse({
  description: 'Novi tokeni su uspešno izdati.',
})
@ApiUnauthorizedResponse({
  description:
    'Refresh token nije validan ili je istekao.',
})
refresh(
  @CurrentUser()
  user: RefreshAuthenticatedUser,
) {
  return this.authService.refreshTokens(
    user.id,
    user.refreshToken,
  );
}

@Post('logout')
@UseGuards(JwtAuthGuard)
@HttpCode(HttpStatus.OK)
@ApiBearerAuth()
@ApiOperation({
  summary: 'Odjava trenutno prijavljenog korisnika',
})
@ApiOkResponse({
  description: 'Korisnik je uspešno odjavljen.',
})
@ApiUnauthorizedResponse({
  description:
    'Access token nije validan ili je istekao.',
})
logout(
  @CurrentUser('id') userId: string,
) {
  return this.authService.logout(userId);
}
}
