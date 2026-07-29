import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ChangePasswordDto } from './dto/change-password.dto';
import { OrderStatus, PaymentStatus, Prisma, UserRole } from '@prisma/client';
import { UsersQueryDto } from './dto/users-query.dto';
@Injectable()
export class UsersService {
  private static readonly SALT_ROUNDS = 10;
  async updateRefreshTokenHash(userId: string, hashedRefreshToken: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken,
      },
    });
  }

  async removeRefreshTokenHash(userId: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken: null,
      },
    });
  }

  async findByIdWithRefreshToken(userId: string) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }
  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
      omit: {
        password: true,
      },
    });
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException(
        'New password and confirmation do not match.',
      );
    }

    const isSamePassword = await bcrypt.compare(
      changePasswordDto.newPassword,
      user.password,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from the current password.',
      );
    }

    const hashedPassword = await this.hashPassword(
      changePasswordDto.newPassword,
    );

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    return {
      message: 'Password changed successfully.',
    };
  }
  constructor(private readonly prisma: PrismaService) {}
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: updateProfileDto,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  async findAll(query: UsersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where: Prisma.UserWhereInput = {
      ...(query.role && { role: query.role }),
      ...(query.search && {
        OR: [
          {
            email: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
          {
            firstName: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
          {
            lastName: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
              reviews: true,
              wishlist: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);
    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };
  }

  async findAdminById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
            wishlist: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('Korisnik nije pronađen.');
    }
    const spent = await this.prisma.order.aggregate({
      where: {
        userId,
        paymentStatus: PaymentStatus.PAID,
        status: { not: OrderStatus.CANCELLED },
      },
      _sum: { totalPrice: true },
    });

    return {
      ...user,
      statistics: {
        orders: user._count.orders,
        reviews: user._count.reviews,
        wishlistItems: user._count.wishlist,
        totalSpent: Number(
          (spent._sum.totalPrice ?? new Prisma.Decimal(0)).toFixed(2),
        ),
      },
    };
  }

  async updateRole(currentAdminId: string, userId: string, role: UserRole) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Korisnik nije pronađen.');
    }
    if (
      currentAdminId === userId &&
      user.role === UserRole.ADMIN &&
      role !== UserRole.ADMIN
    ) {
      const administratorCount = await this.prisma.user.count({
        where: { role: UserRole.ADMIN },
      });
      if (administratorCount <= 1) {
        throw new ConflictException(
          'Jedini administrator ne može ukloniti sopstvenu ADMIN rolu.',
        );
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  async remove(currentAdminId: string, userId: string) {
    if (currentAdminId === userId) {
      throw new ConflictException(
        'Administrator ne može obrisati sopstveni nalog.',
      );
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('Korisnik nije pronađen.');
    }

    try {
      await this.prisma.user.delete({ where: { id: userId } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Korisnik ne može biti obrisan jer ima povezanu poslovnu istoriju.',
        );
      }
      throw error;
    }

    return { message: 'Korisnik je uspešno obrisan.' };
  }

  async create(createUserDto: CreateUserDto) {
    await this.checkEmailExists(createUserDto.email);

    const hashedPassword = await this.hashPassword(createUserDto.password);

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  private async checkEmailExists(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      throw new ConflictException('Email already exists.');
    }
  }

  private async hashPassword(password: string) {
    return bcrypt.hash(password, UsersService.SALT_ROUNDS);
  }
}
