import { BaseEntity } from '../../../../shared/domain/entities/base.entity';

export class User extends BaseEntity {
  private userName: string;
  private password: string;
  private phoneNumber: string;
  private lockCounter: number;
  private autoLockTime: number | null;

  constructor(
    id: string,
    userName: string,
    password: string,
    phoneNumber: string,
    lockCounter: number = 0,
    autoLockTime: number | null = null,
  ) {
    super(id);
    this.userName = userName;
    this.password = password;
    this.phoneNumber = phoneNumber;
    this.lockCounter = lockCounter;
    this.autoLockTime = autoLockTime;
  }

  static create(
    userName: string,
    password: string,
    phoneNumber: string,
  ): User {
    // Use undefined instead of null, or generate a proper ID
    const id = require('uuid').v4();
    return new User(id, userName, password, phoneNumber, 0, null);
  }

  getUserName(): string {
    return this.userName;
  }

  getPassword(): string {
    return this.password;
  }

  getPhoneNumber(): string {
    return this.phoneNumber;
  }

  getLockCounter(): number {
    return this.lockCounter;
  }

  getAutoLockTime(): number | null {
    return this.autoLockTime;
  }

  isLocked(currentTimestamp: number): boolean {
    if (!this.autoLockTime) {
      return false;
    }
    return currentTimestamp < this.autoLockTime;
  }

  incrementLockCounter(currentTimestamp: number): void {
    this.lockCounter += 1;
    if (this.lockCounter >= 5) {
      this.autoLockTime = currentTimestamp + 15 * 60;
    }
    this.touch();
  }

  resetLock(): void {
    this.lockCounter = 0;
    this.autoLockTime = null;
    this.touch();
  }

  protected generateId(): string {
    return require('uuid').v4();
  }
}