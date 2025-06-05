import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY is not configured');
    }
    this.key = crypto.scryptSync(encryptionKey, 'salt', 32);
  }

  async encrypt(text: string): Promise<string> {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      // Combine IV, encrypted text, and auth tag
      return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
    } catch (error) {
      this.logger.error(`Encryption failed: ${error.message}`);
      throw error;
    }
  }

  async decrypt(encryptedData: string): Promise<string> {
    try {
      const [ivHex, encryptedText, authTagHex] = encryptedData.split(':');
      
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      this.logger.error(`Decryption failed: ${error.message}`);
      throw error;
    }
  }

  async rotateKey(newKey: string): Promise<void> {
    const oldKey = this.key;
    this.key = crypto.scryptSync(newKey, 'salt', 32);
    
    // Here you would typically re-encrypt all stored secrets with the new key
    // This would require access to the storage layer
    this.logger.log('Encryption key rotated successfully');
  }
} 