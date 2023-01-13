import { Api } from './rpc/interfaces';
import {
  ActorEventHandler,
  ActorEventType,
  ActorEventTypeStrings,
} from './types';

export interface ActorProxy {
  send(messageBody: any): Promise<void>;
  receive(): Promise<any>;

  addEventListener(
    eventTypes: ActorEventTypeStrings[],
    listener: ActorEventHandler
  ): Promise<void>;
  addEventListener(
    eventType: ActorEventTypeStrings,
    listener: ActorEventHandler
  ): Promise<void>;
  addEventListener(listener: ActorEventHandler): Promise<void>;
  removeEventListener(listener: ActorEventHandler): Promise<void>;
  removeAllEventListeners(): Promise<void>;
}

export class RemoteActorProxy implements ActorProxy {
  private actorName: string;

  private api: Api;

  private eventHandlers: Map<ActorEventHandler, number> = new Map();

  private subscriptions: Set<number> = new Set();

  constructor(actorName: string, api: Api) {
    this.actorName = actorName;
    this.api = api;
  }

  getActorName(): string {
    return this.actorName;
  }

  async send(messageBody: any): Promise<void> {
    return this.api.send(this.actorName, messageBody);
  }

  async receive(): Promise<any> {
    return this.api.receive(this.actorName);
  }

  addEventListener(
    eventTypes: ActorEventTypeStrings[],
    listener: ActorEventHandler
  ): Promise<void>;

  addEventListener(
    eventType: ActorEventTypeStrings,
    listener: ActorEventHandler
  ): Promise<void>;

  addEventListener(listener: ActorEventHandler): Promise<void>;

  async addEventListener(
    eventType:
      | ActorEventTypeStrings
      | ActorEventTypeStrings[]
      | ActorEventHandler,
    listener?: ActorEventHandler
  ): Promise<void> {
    let events: ActorEventTypeStrings[];
    let handler: ActorEventHandler;

    if (typeof eventType === 'function') {
      events = Object.keys(ActorEventType) as ActorEventTypeStrings[];
      handler = eventType;
    } else if (typeof eventType === 'string') {
      events = [eventType];
      if (!listener) throw new Error('Listener is required');
      handler = listener;
    } else if (Array.isArray(eventType)) {
      events = eventType;
      if (!listener) throw new Error('Listener is required');
      handler = listener;
    } else {
      throw new Error('Invalid arguments');
    }

    const subscriptionId = await this.api.subscribe(
      events,
      [this.actorName],
      handler
    );

    if (this.subscriptions.has(subscriptionId)) {
      await this.api.unsubscribe(subscriptionId);
      throw new Error('Subscription already exists');
    }

    this.eventHandlers.set(handler, subscriptionId);
    this.subscriptions.add(subscriptionId);
  }

  async removeEventListener(listener: ActorEventHandler) {
    const subscriptionId = this.eventHandlers.get(listener);
    if (subscriptionId) {
      await this.api.unsubscribe(subscriptionId);
      this.eventHandlers.delete(listener);
      this.subscriptions.delete(subscriptionId);
    }
  }

  async removeAllEventListeners() {
    this.subscriptions.forEach(async (subscriptionId) => {
      await this.api.unsubscribe(subscriptionId);
    });
    this.eventHandlers.clear();
    this.subscriptions.clear();
  }
}
