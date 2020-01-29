import { createClient, APIClientConfig } from './client';

export interface ZeitConfig extends APIClientConfig {}

export const zeitAPI = (config: ZeitConfig) => {
  const { baseURL, token } = config;
  return createClient({ baseURL, token });
};
