import { XmlRpcValue } from '@foxglove/xmlrpc';

export type Status = 'idle' | 'pending' | 'resolved' | 'rejected';

export type Actor = {
  actorName: string;
  actorClass: string;
};

export type ActorMessage = {
  actorName: string;
  messageBody: string;
  messageClass?: string;
};

export type ActorEvent = {
  source: string;
  eventType: ActorEventTypeStrings;
  message?: ActorEventMessage;
  messageClass?: string;
};

export enum ActorEventType {
  CREATED = 'CREATED',
  STOPPED = 'STOPPED',
  ABORTED = 'ABORTED',
  MESSAGE_SENT = 'MESSAGE_SENT',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  MESSAGE_PROCESSED = 'MESSAGE_PROCESSED',
}

export type ActorEventTypeStrings = keyof typeof ActorEventType;

export type ActorEventHandler = (event: ActorEvent) => void;

export type ActorEventMessage = {
  senderName: string;
  body: any;
};

export enum RpcType {
  XMLRPC = 'XMLRPC',
  JSONRPC = 'JSONRPC',
}

export type RpcTypeStrings = keyof typeof RpcType;

export type RpcResponse = {
  status: 'ok' | 'error';
  result?: XmlRpcValue;
  message?: string;
};

export type RawJsonRpcError = {
  error?: RpcJsonError;
};

export type RpcJsonError = {
  code: number;
  data: RpcJavaErrorData;
  message: string;
};

export type RpcJavaErrorData = {
  exceptionTypeName?: string;
  message: string;
};
