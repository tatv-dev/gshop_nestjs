 
// src/shared/domain/events/domain.event.ts
export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventId: string;

  constructor() {
    this.occurredOn = new Date();
    this.eventId = this.generateId();
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36);
  }
}
