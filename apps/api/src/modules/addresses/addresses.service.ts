import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateAddressDto,
  UpdateAddressDto,
} from './dto';

@Injectable()
export class AddressesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    userId: string,
    createAddressDto: CreateAddressDto,
  ) {
    const addressCount =
      await this.prisma.address.count({
        where: {
          userId,
        },
      });

    const shouldBeDefault =
      addressCount === 0 ||
      createAddressDto.isDefault === true;

    return this.prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: {
            userId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      return tx.address.create({
        data: {
          firstName: createAddressDto.firstName,
          lastName: createAddressDto.lastName,
          phone: createAddressDto.phone,
          country: createAddressDto.country,
          city: createAddressDto.city,
          postalCode: createAddressDto.postalCode,
          street: createAddressDto.street,
          streetNumber:
            createAddressDto.streetNumber,
          apartment:
            createAddressDto.apartment,
          isDefault: shouldBeDefault,
          userId,
        },
      });
    });
  }

  findAll(userId: string) {
    return this.prisma.address.findMany({
      where: {
        userId,
      },
      orderBy: [
        {
          isDefault: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });
  }

  async findOne(
    userId: string,
    addressId: string,
  ) {
    const address =
      await this.prisma.address.findFirst({
        where: {
          id: addressId,
          userId,
        },
      });

    if (!address) {
      throw new NotFoundException(
        'Adresa nije pronađena.',
      );
    }

    return address;
  }

  async update(
    userId: string,
    addressId: string,
    updateAddressDto: UpdateAddressDto,
  ) {
    const address = await this.findOne(
      userId,
      addressId,
    );

    return this.prisma.$transaction(async (tx) => {
      if (updateAddressDto.isDefault === true) {
        await tx.address.updateMany({
          where: {
            userId,
            isDefault: true,
            id: {
              not: addressId,
            },
          },
          data: {
            isDefault: false,
          },
        });
      }

      return tx.address.update({
        where: {
          id: address.id,
        },
        data: updateAddressDto,
      });
    });
  }

  async remove(
    userId: string,
    addressId: string,
  ) {
    const address = await this.findOne(
      userId,
      addressId,
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.address.delete({
        where: {
          id: address.id,
        },
      });

      if (address.isDefault) {
        const nextAddress =
          await tx.address.findFirst({
            where: {
              userId,
            },
            orderBy: {
              createdAt: 'asc',
            },
          });

        if (nextAddress) {
          await tx.address.update({
            where: {
              id: nextAddress.id,
            },
            data: {
              isDefault: true,
            },
          });
        }
      }
    });

    return {
      message: 'Adresa je uspešno obrisana.',
    };
  }
}