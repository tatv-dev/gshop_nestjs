// src/components/authentication/domain/ports/encryption.port.ts
export interface IEncryptionPort {
  hash(data: string): Promise<string>;
  verify(data: string, hash: string): Promise<boolean>;
}

export const IEncryptionPort = Symbol('IEncryptionPort');