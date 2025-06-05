import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { WalletBindingDto } from '../dto/wallet-binding.dto';
import { verifyStarknetSignature } from '../../../utils/starknet.utils';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async bindWallet(userId: number, walletBindingDto: WalletBindingDto) {
    // Verify wallet signature
    const isValid = await this.verifyWalletSignature(walletBindingDto);
    if (!isValid) {
      throw new BadRequestException('Invalid wallet signature');
    }

    // Check if wallet is already bound to another user
    const existingWallet = await this.prisma.wallet.findFirst({
      where: {
        address: walletBindingDto.address,
        walletType: walletBindingDto.walletType,
      },
    });

    if (existingWallet && existingWallet.userId !== userId) {
      throw new BadRequestException('Wallet already bound to another user');
    }

    // Create or update wallet binding
    const wallet = await this.prisma.wallet.upsert({
      where: {
        userId_walletType: {
          userId,
          walletType: walletBindingDto.walletType,
        },
      },
      update: {
        address: walletBindingDto.address,
        lastVerified: new Date(),
      },
      create: {
        userId,
        walletType: walletBindingDto.walletType,
        address: walletBindingDto.address,
        lastVerified: new Date(),
      },
    });

    return wallet;
  }

  private async verifyWalletSignature(walletBindingDto: WalletBindingDto): Promise<boolean> {
    switch (walletBindingDto.walletType) {
      case 'starknet':
        return verifyStarknetSignature(
          walletBindingDto.address,
          walletBindingDto.signature,
          walletBindingDto.message,
        );
      case 'ethereum':
        // Implement Ethereum signature verification
        return true;
      default:
        throw new BadRequestException('Unsupported wallet type');
    }
  }

  async getUserWallets(userId: number) {
    return this.prisma.wallet.findMany({
      where: { userId },
    });
  }

  async removeWallet(userId: number, walletType: string) {
    return this.prisma.wallet.delete({
      where: {
        userId_walletType: {
          userId,
          walletType,
        },
      },
    });
  }
} 