import {
  Controller,
  Get,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Podaci trenutno prijavljenog korisnika',
  })
  @ApiOkResponse({
    description: 'Podaci korisnika su uspešno vraćeni.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token nedostaje, nije validan ili je istekao.',
  })
  async getMe(
    @CurrentUser('id') userId: string,
  ) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lista svih korisnika — samo administrator',
  })
  @ApiOkResponse({
    description: 'Lista korisnika je uspešno vraćena.',
  })
  @ApiUnauthorizedResponse({
    description: 'Korisnik nije prijavljen.',
  })
  @ApiForbiddenResponse({
    description: 'Korisnik nema administratorska prava.',
  })
  findAll() {
    return this.usersService.findAll();
  }
}