import { Injectable } from '@nestjs/common';
import { ApiException } from '../../../shared/types/api-error-code.type';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UserEntity } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async getProfile(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ApiException(404, 'AUTH_007', 'User not found');
    }
    return UserEntity.fromPrisma(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserEntity> {
    await this.getProfile(userId);
    const updated = await this.userRepository.update(userId, dto);
    return UserEntity.fromPrisma(updated);
  }

  async findById(userId: string): Promise<UserEntity> {
    return this.getProfile(userId);
  }
}
