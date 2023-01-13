import { ActorEventTypeStrings, ActorEvent, RpcResponse } from '../types';

export interface Api {
  spawnActor(actorName: string, actorClass: string): Promise<void>;
  getNames(): Promise<string[]>;
  subscribe(
    eventTypes: ActorEventTypeStrings[],
    actorNames: string[],
    callback: (event: ActorEvent) => void
  ): Promise<number>;
  unsubscribe(subscriptionId: number): Promise<void>;
  send(
    actorName: string,
    messageArgs: any[],
    messageClass?: string
  ): Promise<void>;
  receive(actorName: string, timeout?: number): Promise<any>;
}

export interface RpcApi {
  spawnActor(actorName: string, actorClass: string): Promise<RpcResponse>;
  getNames(): Promise<RpcResponse>;
  subscribe(eventTypes: string[], actorNames: string[]): Promise<RpcResponse>;
  unsubscribe(subscriptionId: number): Promise<RpcResponse>;
  send(
    actorName: string,
    messageArgs: any[] | string,
    messageClass?: string
  ): Promise<RpcResponse>;
  receive(actorName: string, timeout?: number): Promise<RpcResponse>;
}

export interface RpcClient {
  methodCall(method: string, params: any[]): Promise<any>;
}
