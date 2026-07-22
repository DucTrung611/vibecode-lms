import { User } from '@prisma/client';

export class UserEntity {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  static fromPrisma(user: User): UserEntity {
    const entity = new UserEntity();
    entity.id = user.id;
    entity.email = user.email;
    entity.fullName = user.fullName;
    entity.avatarUrl = user.avatarUrl;
    entity.bio = user.bio;
    entity.role = user.role;
    entity.status = user.status;
    entity.createdAt = user.createdAt;
    entity.updatedAt = user.updatedAt;
    return entity;
  }
}
