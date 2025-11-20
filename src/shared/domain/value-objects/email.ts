 
// src/shared/domain/value-objects/email.ts
import { DomainException } from '../exceptions/domain.exception';

export class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!this.isValid(email)) {
      throw new DomainException({
        messageKey: 'invalid_email_format',
        params: { email },
      });
    }
    this.value = email.toLowerCase().trim();
  }

  getValue(): string {
    return this.value;
  }

  getDomain(): string {
    return this.value.split('@')[1];
  }

  isGoogleEmail(): boolean {
    return this.getDomain() === 'gmail.com';
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  }

  toString(): string {
    return this.value;
  }
}