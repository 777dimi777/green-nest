import { UserRole } from '@prisma/client';

export interface RefreshAuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  refreshToken: string;
}