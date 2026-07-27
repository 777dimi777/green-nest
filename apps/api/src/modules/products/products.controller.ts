import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Delete,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsQueryDto } from './dto/products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new product',
    description:
      'Creates a product with plant details, category and optional images. Admin only.',
  })
  @ApiCreatedResponse({
    description: 'Product created successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Access token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can create products.',
  })
  @ApiNotFoundResponse({
    description: 'Selected category does not exist.',
  })
  create(
    @Body()
    createProductDto: CreateProductDto,
  ) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get published products',
    description:
      'Returns published products with search, filters, sorting and pagination.',
  })
  @ApiOkResponse({
    description: 'Products returned successfully.',
  })
  findAll(
    @Query()
    query: ProductsQueryDto,
  ) {
    return this.productsService.findAll(query);
  }
  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get product by ID for administration',
  })
  @ApiOkResponse({
    description: 'Product returned successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Access token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can access this product.',
  })
  @ApiNotFoundResponse({
    description: 'Product does not exist.',
  })
  findById(
    @Param('id')
    id: string,
  ) {
    return this.productsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a product',
    description: 'Updates selected product fields. Admin only.',
  })
  @ApiOkResponse({
    description: 'Product updated successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Access token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can update products.',
  })
  @ApiNotFoundResponse({
    description: 'Product or selected category does not exist.',
  })
  @ApiConflictResponse({
    description: 'The submitted SKU already exists.',
  })
  update(
    @Param('id')
    id: string,

    @Body()
    updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a product',
    description:
      'Deletes a product that has not been used in an order. Admin only.',
  })
  @ApiOkResponse({
    description: 'Product deleted successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Access token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can delete products.',
  })
  @ApiNotFoundResponse({
    description: 'Product does not exist.',
  })
  @ApiConflictResponse({
    description: 'Product exists in an order and cannot be deleted.',
  })
  remove(
    @Param('id')
    id: string,
  ) {
    return this.productsService.remove(id);
  }
  @Get(':slug')
  @ApiOperation({
    summary: 'Get product by slug',
    description: 'Returns the public details of one published product.',
  })
  @ApiOkResponse({
    description: 'Product returned successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Product does not exist or is not published.',
  })
  findBySlug(
    @Param('slug')
    slug: string,
  ) {
    return this.productsService.findBySlug(slug);
  }
}
