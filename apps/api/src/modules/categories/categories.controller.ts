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
import { UserRole } from '@prisma/client';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Kreiranje kategorije — samo administrator',
  })
  @ApiCreatedResponse({
    description: 'Kategorija je uspešno kreirana.',
  })
  @ApiBadRequestResponse({
    description: 'Podaci nisu validni ili roditeljska kategorija ne postoji.',
  })
  @ApiConflictResponse({
    description: 'Kategorija sa ovim nazivom već postoji.',
  })
  @ApiUnauthorizedResponse({
    description: 'Korisnik nije prijavljen.',
  })
  @ApiForbiddenResponse({
    description: 'Korisnik nema administratorska prava.',
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Javna lista svih kategorija',
  })
  @ApiOkResponse({
    description: 'Kategorije su uspešno vraćene.',
  })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin details of a category by ID' })
  @ApiOkResponse({ description: 'Category details returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated.' })
  @ApiForbiddenResponse({ description: 'Administrator access is required.' })
  @ApiNotFoundResponse({ description: 'Category was not found.' })
  findAdminById(@Param('id') categoryId: string) {
    return this.categoriesService.findAdminById(categoryId);
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Javni detalji kategorije po slug-u',
  })
  @ApiOkResponse({
    description: 'Kategorija je uspešno vraćena.',
  })
  @ApiNotFoundResponse({
    description: 'Kategorija nije pronađena.',
  })
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Izmena kategorije — samo administrator',
  })
  @ApiOkResponse({
    description: 'Kategorija je uspešno izmenjena.',
  })
  @ApiBadRequestResponse({
    description: 'Poslati podaci nisu validni.',
  })
  @ApiNotFoundResponse({
    description: 'Kategorija nije pronađena.',
  })
  @ApiConflictResponse({
    description: 'Kategorija sa ovim nazivom već postoji.',
  })
  update(
    @Param('id') categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(categoryId, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Brisanje kategorije — samo administrator',
  })
  @ApiOkResponse({
    description: 'Kategorija je uspešno obrisana.',
  })
  @ApiBadRequestResponse({
    description: 'Kategorija sadrži proizvode ili potkategorije.',
  })
  @ApiNotFoundResponse({
    description: 'Kategorija nije pronađena.',
  })
  @ApiUnauthorizedResponse({
    description: 'Korisnik nije prijavljen.',
  })
  @ApiForbiddenResponse({
    description: 'Korisnik nema administratorska prava.',
  })
  remove(@Param('id') categoryId: string) {
    return this.categoriesService.remove(categoryId);
  }
}
