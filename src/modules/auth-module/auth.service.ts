import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { verifyStarknetSignature } from '../../utils/starknet.utils';
import { UserRole } from '../users/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await this.usersService.validatePassword(user, password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async validateStarknetSignature(address: string, signature: string, message: string): Promise<boolean> {
    return verifyStarknetSignature(address, signature, message);
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id,
      role: user.role 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  }

  async register(userData: {
    email: string;
    password: string;
    role?: UserRole;
    starknetAddress?: string;
  }) {
    const user = await this.usersService.create(userData);
    return this.login(user);
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    const { password, ...result } = user;
    return result;
  }
} 