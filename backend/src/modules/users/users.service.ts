import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

/**
 * UsersService
 * 
 * Manages user accounts and role assignments.
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new user with roles
   */
  async create(createUserDto: CreateUserDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user with roles
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password_hash: hashedPassword,
        full_name: createUserDto.full_name,
        user_roles: {
          create: createUserDto.role_ids.map((roleId) => ({
            role: {
              connect: { id: roleId },
            },
          })),
        },
      },
      include: {
        user_roles: {
          include: {
            role: true,
          },
        },
      },
    });

    this.logger.log(`User created: ${user.email}`);

    const { password_hash, ...result } = user;
    return result;
  }

  /**
   * Find all users
   */
  async findAll() {
    return this.prisma.user.findMany({
      where: { deleted_at: null },
      include: {
        user_roles: {
          include: {
            role: true,
          },
        },
        lab_member: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Find user by ID
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        user_roles: {
          include: {
            role: true,
          },
        },
        lab_member: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Find user by ID with roles (for auth)
   */
  async findByIdWithRoles(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        user_roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Update user
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findById(id);

    // If updating email, check for conflicts
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (updateUserDto.password) {
      hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(updateUserDto.email && { email: updateUserDto.email }),
        ...(updateUserDto.full_name && { full_name: updateUserDto.full_name }),
        ...(hashedPassword && { password_hash: hashedPassword }),
        ...(updateUserDto.is_active !== undefined && { is_active: updateUserDto.is_active }),
      },
      include: {
        user_roles: {
          include: {
            role: true,
          },
        },
      },
    });

    this.logger.log(`User updated: ${updated.email}`);

    const { password_hash, ...result } = updated;
    return result;
  }

  /**
   * Soft delete user
   */
  async remove(id: string) {
    await this.findById(id);

    await this.prisma.user.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        is_active: false,
      },
    });

    this.logger.log(`User soft deleted: ${id}`);

    return { message: 'User deleted successfully' };
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: string, roleId: string) {
    await this.findById(userId);

    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if role already assigned
    const existing = await this.prisma.userRole.findFirst({
      where: {
        user_id: userId,
        role_id: roleId,
      },
    });

    if (existing) {
      throw new ConflictException('Role already assigned to user');
    }

    const userRole = await this.prisma.userRole.create({
      data: {
        user_id: userId,
        role_id: roleId,
      },
      include: {
        role: true,
      },
    });

    this.logger.log(`Role ${role.name} assigned to user ${userId}`);

    return userRole;
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: string, roleId: string) {
    const userRole = await this.prisma.userRole.findFirst({
      where: {
        user_id: userId,
        role_id: roleId,
      },
    });

    if (!userRole) {
      throw new NotFoundException('User role assignment not found');
    }

    await this.prisma.userRole.delete({
      where: { id: userRole.id },
    });

    this.logger.log(`Role ${roleId} removed from user ${userId}`);

    return { message: 'Role removed successfully' };
  }
}
