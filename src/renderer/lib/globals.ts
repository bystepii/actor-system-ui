import { createContext } from 'react';
import { createApiFromUrl } from './rpc/api';

export const ApiContext = createContext(
  createApiFromUrl('http://localhost:8080/jsonrpc')
);

export const ColorModeContext = createContext({ toggleColorMode: () => {} });
