import { RpcResponse } from '../types';
import { RpcApi, RpcClient } from './interfaces';

export default class RpcApiImpl implements RpcApi {
  private client: RpcClient;

  constructor(client: RpcClient) {
    this.client = client;
  }

  async spawnActor(
    actorName: string,
    actorClass: string
  ): Promise<RpcResponse> {
    return (await this.client.methodCall('api.spawnActor', [
      actorName,
      actorClass,
    ])) as RpcResponse;
  }

  async getNames(): Promise<RpcResponse> {
    return (await this.client.methodCall('api.getNames', [])) as RpcResponse;
  }

  async subscribe(
    eventTypes: string[],
    actorNames: string[]
  ): Promise<RpcResponse> {
    return (await this.client.methodCall('api.subscribe', [
      eventTypes,
      actorNames,
    ])) as RpcResponse;
  }

  async unsubscribe(subscriptionId: number): Promise<RpcResponse> {
    return (await this.client.methodCall('api.unsubscribe', [
      subscriptionId,
    ])) as RpcResponse;
  }

  async send(
    actorName: string,
    messageArgs: any[] | string,
    messageClass?: string
  ): Promise<RpcResponse> {
    if (messageClass !== undefined) {
      const args = Array.isArray(messageArgs) ? messageArgs : [messageArgs];
      return (await this.client.methodCall('api.send', [
        actorName,
        messageClass,
        args,
      ])) as RpcResponse;
    }
    if (Array.isArray(messageArgs))
      throw new Error(
        "Message arguments must be a string if messageClass isn't specified"
      );

    return (await this.client.methodCall('api.send', [
      actorName,
      messageArgs,
    ])) as RpcResponse;
  }

  async receive(actorName: string, timeout?: number): Promise<RpcResponse> {
    if (timeout) {
      return (await this.client.methodCall('api.receive', [
        actorName,
        timeout,
      ])) as RpcResponse;
    }
    return (await this.client.methodCall('api.receive', [
      actorName,
    ])) as RpcResponse;
  }
}
