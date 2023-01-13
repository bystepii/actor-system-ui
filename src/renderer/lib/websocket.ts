import { ActorEvent } from './types';

type ActorEventCallback = (event: ActorEvent) => void;

export default class WebSocketEventDispatcher {
  private subscriptionId: number;

  private ws: WebSocket;

  private eventHandler: ActorEventCallback;

  constructor(
    url: string,
    subscriptionId: number,
    eventHandler: ActorEventCallback
  ) {
    this.ws = new WebSocket(url);
    this.subscriptionId = subscriptionId;
    this.eventHandler = eventHandler;

    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({ subscriptionId: this.subscriptionId }));
    };

    this.ws.onmessage = (event) => {
      const actorEvent = JSON.parse(event.data) as ActorEvent;
      this.eventHandler(actorEvent);
    };
  }

  close() {
    this.ws.close();
  }
}
