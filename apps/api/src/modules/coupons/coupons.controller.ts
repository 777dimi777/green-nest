import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@ApiTags('Coupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @ApiOperation({ summary: 'Kreiranje novog kupona' })
  @ApiCreatedResponse({ description: 'Kupon je uspešno kreiran.' })
  @ApiConflictResponse({ description: 'Kod kupona već postoji.' })
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponsService.create(createCouponDto);
  }

  @Get()
  @ApiOperation({ summary: 'Pregled svih kupona' })
  @ApiOkResponse({ description: 'Kuponi sortirani od najnovijeg.' })
  findAll() {
    return this.couponsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Pregled jednog kupona' })
  @ApiOkResponse({ description: 'Detalji kupona.' })
  @ApiNotFoundResponse({ description: 'Kupon nije pronađen.' })
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Izmena kupona' })
  @ApiOkResponse({ description: 'Kupon je uspešno izmenjen.' })
  @ApiNotFoundResponse({ description: 'Kupon nije pronađen.' })
  @ApiConflictResponse({ description: 'Kod kupona već postoji.' })
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponsService.update(id, updateCouponDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Brisanje kupona' })
  @ApiNoContentResponse({ description: 'Kupon je uspešno obrisan.' })
  @ApiNotFoundResponse({ description: 'Kupon nije pronađen.' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.couponsService.remove(id);
  }
}
