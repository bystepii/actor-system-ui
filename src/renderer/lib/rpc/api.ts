import { ActorEventHandler, ActorEventTypeStrings } from '../types';
import WebSocketEventDispatcher from '../websocket';
import XmlRpcClientWrapper from './XmlRpcClientWrapper';
import JsonRpcClientWrapper from './JsonRpcClientWrapper';
import RpcApiImpl from './RpcApiImpl';
import { Api, RpcApi } from './interfaces';

export class ApiWrapper implements Api {
  private apiImpl: RpcApi;

  private wsMap: Map<number, WebSocketEventDispatcher> = new Map();

  constructor(apiImpl: RpcApi) {
    this.apiImpl = apiImpl;
  }

  async spawnActor(actorName: string, actorClass: string) {
    const res = await this.apiImpl.spawnActor(actorName, actorClass);
    if (res.status === 'error') throw new Error(res.message);
  }

  async getNames(): Promise<string[]> {
    const res = await this.apiImpl.getNames();
    if (res.status === 'error') throw new Error(res.message);
    return res.result as string[];
  }

  async subscribe(
    eventTypes: ActorEventTypeStrings[],
    actorNames: string[],
    callback: ActorEventHandler
  ): Promise<number> {
    const res = await this.apiImpl.subscribe(eventTypes, actorNames);

    if (res.status === 'error') throw new Error(res.message);

    type Respone = {
      subscriptionId: number;
      url: string;
    };

    const response = res.result as Respone;
    const ws = new WebSocketEventDispatcher(
      response.url,
      response.subscriptionId,
      callback
    );
    this.wsMap.set(response.subscriptionId, ws);

    return response.subscriptionId;
  }

  async unsubscribe(subscriptionId: number): Promise<void> {
    const ws = this.wsMap.get(subscriptionId);
    if (ws) ws.close();

    this.wsMap.delete(subscriptionId);
    const res = await this.apiImpl.unsubscribe(subscriptionId);
    if (res.status === 'error') throw new Error(res.message);
  }

  async send(actorName: string, messageArgs: any[], messageClass?: string) {
    const res = await this.apiImpl.send(actorName, messageArgs, messageClass);
    if (res.status === 'error') throw new Error(res.message);
  }

  async receive(actorName: string, timeout?: number) {
    const res = await this.apiImpl.receive(actorName, timeout);
    if (res.status === 'error') throw new Error(res.message);
    return res.result;
  }
}

export function createApi(apiImpl: RpcApi): Api {
  return new ApiWrapper(apiImpl);
}

export function createApiFromUrl(url: string): Api {
  const parsedUrl = new URL(url);
  const rpcType = parsedUrl.pathname.split('/').pop();
  switch (rpcType) {
    case 'jsonrpc':
      return createApi(new RpcApiImpl(new JsonRpcClientWrapper(url)));
    case 'xmlrpc':
      return createApi(new RpcApiImpl(new XmlRpcClientWrapper(url)));
    default:
      throw new Error(`Unknown rpc type: ${rpcType}`);
  }
}
