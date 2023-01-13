import { JSONRPCClient } from 'json-rpc-2.0';
import { RawJsonRpcError } from '../types';
import { RpcClient } from './interfaces';

export default class JsonRpcClientWrapper implements RpcClient {
  private jsonRpcClient: JSONRPCClient;

  constructor(url: string) {
    this.jsonRpcClient = new JSONRPCClient((jsonRPCRequest) =>
      fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(jsonRPCRequest),
      })
        .then(async (response) => {
          if (response.status === 200) {
            // Use client.receive when you received a JSON-RPC response.
            return response.json();
          }
          const error = (await response.json()) as RawJsonRpcError;
          if (error.error) {
            const errorData = error.error.data;
            if (errorData !== undefined) {
              if (errorData.exceptionTypeName !== undefined)
                throw new Error(
                  `Error from Java: ${errorData.exceptionTypeName}: ${errorData.message}`
                );
              throw new Error(`Error: ${errorData.message}`);
            }
            if (error.error.message !== undefined)
              throw new Error(`${error.error.message}`);
          }
          throw new Error('Unknown error');
        })
        .then((jsonRPCResponse) => this.jsonRpcClient.receive(jsonRPCResponse))
    );
  }

  async methodCall(method: string, params: any[]): Promise<any> {
    return this.jsonRpcClient.request(method, params);
  }
}
