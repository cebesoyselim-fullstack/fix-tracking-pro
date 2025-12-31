import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { JwtPayload, UserWithoutPassword } from './interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserWithoutPassword> {
    // Find user by email (need to access Prisma directly to get password)
    const user = await this.usersService.findByEmailForAuth(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Return user without password
    const { password: _, ...result } = user;
    return result;
  }

  async login(user: UserWithoutPassword) {
    // Create JWT payload (include role for RBAC)
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    // Sign and return JWT token
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

