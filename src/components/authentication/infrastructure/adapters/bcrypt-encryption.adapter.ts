import { Injectable } from '@nestjs/common';
import { IEncryptionPort } from '../../domain/ports/encryption.port';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptEncryptionAdapter implements IEncryptionPort {
  private readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async verify(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
