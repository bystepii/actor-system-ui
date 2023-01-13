import { XmlRpcClient } from '@foxglove/xmlrpc';
import { RpcClient } from './interfaces';

export default class XmlRpcClientWrapper implements RpcClient {
  private xmlRpcClient: XmlRpcClient;

  constructor(url: string) {
    this.xmlRpcClient = new XmlRpcClient(url);
  }

  async methodCall(method: string, params: any[]): Promise<any> {
    return this.xmlRpcClient.methodCall(method, params);
  }
}
