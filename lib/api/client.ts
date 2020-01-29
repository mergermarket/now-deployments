import axios from 'axios';
import { APIClientConfig } from '../types';


export default (config: APIClientConfig) => {
  const { token, baseURL } = config;
  const client = axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return client;
};
