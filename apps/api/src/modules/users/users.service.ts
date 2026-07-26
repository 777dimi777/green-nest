import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  private static readonly SALT_ROUNDS = 10;
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
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
async create(createUserDto: CreateUserDto) {

  await this.checkEmailExists(createUserDto.email);

  const hashedPassword =
      await this.hashPassword(createUserDto.password);

  const user = await this.prisma.user.create({
    data: {
      ...createUserDto,
      password: hashedPassword,
    },
  });

  const { password, ...userWithoutPassword } = user;

  return userWithoutPassword;
}
}
