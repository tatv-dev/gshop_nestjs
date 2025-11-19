// src/shared/domain/entities/base.entity.ts
export abstract class BaseEntity {
  public readonly id: string;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(id?: string) {
    this.id = id || this.generateId();
    this.createdAt = new Date();
    this._updatedAt = new Date();
  }

  protected abstract generateId(): string;

  get updatedAt(): Date {
    return this._updatedAt;
  }

  public touch(): void {
    this._updatedAt = new Date();
  }

  public equals(other: BaseEntity): boolean {
    return this.id === other.id;
  }

  // Static helper method for reconstitution
  protected static reconstituteBase<T extends BaseEntity>(
    entityClass: new (...args: any[]) => T,
    id: string,
    createdAt: Date,
    updatedAt: Date
  ): T {
    // Create instance without calling constructor
    const instance = Object.create(entityClass.prototype);
    
    // Set readonly properties using Object.defineProperty
    Object.defineProperty(instance, 'id', {
      value: id,
      writable: false,
      enumerable: true,
      configurable: false
    });
    
    Object.defineProperty(instance, 'createdAt', {
      value: createdAt,
      writable: false,
      enumerable: true,
      configurable: false
    });
    
    // Set private property directly
    instance._updatedAt = updatedAt;
    
    return instance;
  }
}

