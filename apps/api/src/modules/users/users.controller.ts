import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
  UseGuards,
  HttpCode,
  HttpStatus,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersQueryDto } from './dto/users-query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
  async getMe(@CurrentUser('id') userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Izmena profila trenutno prijavljenog korisnika',
  })
  @ApiOkResponse({
    description: 'Profil je uspešno ažuriran.',
  })
  @ApiBadRequestResponse({
    description: 'Poslati podaci nisu validni.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token nedostaje, nije validan ili je istekao.',
  })
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }
  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Promena lozinke trenutno prijavljenog korisnika',
  })
  @ApiOkResponse({
    description: 'Lozinka je uspešno promenjena.',
  })
  @ApiBadRequestResponse({
    description:
      'Nove lozinke se ne poklapaju ili je nova lozinka ista kao trenutna.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token nije validan ili trenutna lozinka nije ispravna.',
  })
  changePassword(
    @CurrentUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, changePasswordDto);
  }
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
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
  findAll(@Query() query: UsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin pregled korisnika i statistika' })
  @ApiOkResponse({ description: 'Korisnik i statistike su vraćeni.' })
  @ApiUnauthorizedResponse({ description: 'Korisnik nije prijavljen.' })
  @ApiForbiddenResponse({ description: 'Potreban je ADMIN pristup.' })
  @ApiNotFoundResponse({ description: 'Korisnik nije pronađen.' })
  findAdminById(@Param('id') userId: string) {
    return this.usersService.findAdminById(userId);
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin promena uloge korisnika' })
  @ApiOkResponse({ description: 'Uloga je uspešno promenjena.' })
  @ApiUnauthorizedResponse({ description: 'Korisnik nije prijavljen.' })
  @ApiForbiddenResponse({ description: 'Potreban je ADMIN pristup.' })
  @ApiNotFoundResponse({ description: 'Korisnik nije pronađen.' })
  @ApiConflictResponse({
    description: 'Jedini administrator ne može ukloniti svoju ulogu.',
  })
  updateRole(
    @CurrentUser('id') currentAdminId: string,
    @Param('id') userId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateRole(currentAdminId, userId, dto.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin brisanje korisnika' })
  @ApiOkResponse({ description: 'Korisnik je uspešno obrisan.' })
  @ApiUnauthorizedResponse({ description: 'Korisnik nije prijavljen.' })
  @ApiForbiddenResponse({ description: 'Potreban je ADMIN pristup.' })
  @ApiNotFoundResponse({ description: 'Korisnik nije pronađen.' })
  @ApiConflictResponse({
    description:
      'Nalog pripada administratoru ili ima povezanu poslovnu istoriju.',
  })
  remove(
    @CurrentUser('id') currentAdminId: string,
    @Param('id') userId: string,
  ) {
    return this.usersService.remove(currentAdminId, userId);
  }
}
