
// src/shared/domain/events/event-publisher.ts
import { DomainEvent } from './domain.event';

export interface EventPublisher {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
}