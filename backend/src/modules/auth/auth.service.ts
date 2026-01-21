import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

/**
 * AuthService
 * 
 * Handles authentication logic:
 * - User login with email/password
 * - JWT token generation (access + refresh tokens)
 * - Token refresh
 * - Password validation
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get user roles
    const userWithRoles = await this.usersService.findByIdWithRoles(user.id);

    if (!userWithRoles) {
      throw new UnauthorizedException('User not found');
    }

    const { password_hash, ...result } = userWithRoles as any;
    return result;
  }

  /**
   * Login user and return access + refresh tokens
   */
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.user_roles.map((ur: any) => ur.role.name),
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        roles: payload.roles,
      },
    };
  }

  /**
   * Generate refresh token and store in database
   */
  async generateRefreshToken(userId: string): Promise<string> {
    const payload = { sub: userId, type: 'refresh' };

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Store refresh token in database
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refresh_token: refreshToken,
        refresh_token_expires: expiresAt,
      },
    });

    return refreshToken;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Verify refresh token exists in database and hasn't expired
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          user_roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user || user.refresh_token !== refreshTokenDto.refresh_token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (!user.refresh_token_expires || user.refresh_token_expires < new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      if (!user.is_active) {
        throw new UnauthorizedException('Account is inactive');
      }

      // Generate new access token
      const newPayload = {
        sub: user.id,
        email: user.email,
        roles: user.user_roles.map((ur) => ur.role.name),
      };

      const accessToken = this.jwtService.sign(newPayload);

      this.logger.log(`Token refreshed for user: ${user.email}`);

      return {
        access_token: accessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refresh_token: null,
        refresh_token_expires: null,
      },
    });

    this.logger.log(`User logged out: ${userId}`);
  }

  /**
   * Hash password
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}
