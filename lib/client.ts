import axios from 'axios';

export interface APIClientConfig {
  baseURL: string
  token: string
}

export const createClient = (config: APIClientConfig) => {
  const { token, baseURL } = config;
  const client = axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return client;
};
