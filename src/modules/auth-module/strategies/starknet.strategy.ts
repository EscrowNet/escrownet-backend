import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class StarknetStrategy extends PassportStrategy(Strategy, 'starknet') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(req: Request): Promise<any> {
    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      throw new UnauthorizedException('Missing required fields');
    }

    const isValid = await this.authService.validateStarknetSignature(
      address,
      signature,
      message,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    return { address };
  }
} 