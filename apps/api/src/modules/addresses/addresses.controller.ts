import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AddressesService } from './addresses.service';
import {
  CreateAddressDto,
  UpdateAddressDto,
} from './dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@ApiTags('Addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(
    private readonly addressesService: AddressesService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Dodavanje nove adrese prijavljenog korisnika',
  })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.addressesService.create(
      user.id,
      createAddressDto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Pregled svih adresa prijavljenog korisnika',
  })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.addressesService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Pregled jedne adrese prijavljenog korisnika',
  })
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') addressId: string,
  ) {
    return this.addressesService.findOne(
      user.id,
      addressId,
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Izmena adrese prijavljenog korisnika',
  })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') addressId: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(
      user.id,
      addressId,
      updateAddressDto,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Brisanje adrese prijavljenog korisnika',
  })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') addressId: string,
  ) {
    return this.addressesService.remove(
      user.id,
      addressId,
    );
  }
}