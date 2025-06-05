import { Controller, Post, Body, Get, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(
    @Body()
    registerDto: {
      email: string;
      password: string;
      role?: UserRole;
      starknetAddress?: string;
    },
  ) {
    return this.authService.register(registerDto);
  }

  @Post('starknet-login')
  async starknetLogin(
    @Body()
    loginDto: {
      address: string;
      signature: string;
      message: string;
    },
  ) {
    const isValid = await this.authService.validateStarknetSignature(
      loginDto.address,
      loginDto.signature,
      loginDto.message,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }
    // Find or create user based on Starknet address
    const user = await this.usersService.findOrCreateByStarknetAddress(
      loginDto.address,
    );
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.ARBITRATOR)
  @Get('me')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }
} 