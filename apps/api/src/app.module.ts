import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './database/prisma.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}