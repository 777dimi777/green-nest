import {
  Controller,
  Get,
  NotFoundException,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

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
  async getMe(@Req() request: AuthenticatedRequest) {
    const user = await this.usersService.findById(
      request.user.id,
    );

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }
}