import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const slug = this.createSlug(createCategoryDto.name);

    await this.ensureSlugIsUnique(slug);

    if (createCategoryDto.parentId) {
      await this.ensureParentExists(
        createCategoryDto.parentId,
      );
    }

    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        slug,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        children: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findBySlug(slug: string) {
    const category =
      await this.prisma.category.findUnique({
        where: {
          slug,
        },
        include: {
          parent: true,
          children: true,
          products: {
            where: {
              published: true,
            },
            include: {
              images: {
                where: {
                  isPrimary: true,
                },
              },
            },
          },
        },
      });

    if (!category) {
      throw new NotFoundException(
        'Category not found.',
      );
    }

    return category;
  }

  async update(
    categoryId: string,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    const existingCategory =
      await this.findById(categoryId);

    let slug = existingCategory.slug;

    if (
      updateCategoryDto.name &&
      updateCategoryDto.name !== existingCategory.name
    ) {
      slug = this.createSlug(updateCategoryDto.name);

      await this.ensureSlugIsUnique(
        slug,
        categoryId,
      );
    }

    if (updateCategoryDto.parentId) {
      if (updateCategoryDto.parentId === categoryId) {
        throw new BadRequestException(
          'Category cannot be its own parent.',
        );
      }

      await this.ensureParentExists(
        updateCategoryDto.parentId,
      );
    }

    return this.prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        ...updateCategoryDto,
        slug,
      },
    });
  }

  async remove(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(
        'Category not found.',
      );
    }

    if (category._count.products > 0) {
      throw new BadRequestException(
        'Category cannot be deleted because it contains products.',
      );
    }

    if (category._count.children > 0) {
      throw new BadRequestException(
        'Category cannot be deleted because it contains child categories.',
      );
    }

    await this.prisma.category.delete({
      where: {
        id: categoryId,
      },
    });

    return {
      message: 'Category deleted successfully.',
    };
  }

  private async findById(categoryId: string) {
    const category =
      await this.prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

    if (!category) {
      throw new NotFoundException(
        'Category not found.',
      );
    }

    return category;
  }

  private async ensureSlugIsUnique(
    slug: string,
    ignoredCategoryId?: string,
  ) {
    const existingCategory =
      await this.prisma.category.findUnique({
        where: {
          slug,
        },
      });

    if (
      existingCategory &&
      existingCategory.id !== ignoredCategoryId
    ) {
      throw new ConflictException(
        'Category with this name already exists.',
      );
    }
  }

  private async ensureParentExists(parentId: string) {
    const parent =
      await this.prisma.category.findUnique({
        where: {
          id: parentId,
        },
      });

    if (!parent) {
      throw new BadRequestException(
        'Parent category does not exist.',
      );
    }
  }

  private createSlug(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'dj')
      .replace(/Đ/g, 'dj')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}