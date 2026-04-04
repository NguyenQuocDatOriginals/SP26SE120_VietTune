import axios, { AxiosInstance } from 'axios';

import { getItem } from '@/services/storageService';

type CreateAiApiClientOptions = {
  baseURL: string;
  timeout?: number;
};

/**
 * Shared AI HTTP client factory.
 * Keeps token header behavior consistent for AI endpoints.
 */
export function createAiApiClient({
  baseURL,
  timeout = 45000,
}: CreateAiApiClientOptions): AxiosInstance {
  const token = getItem('access_token');
  return axios.create({
    baseURL: baseURL.replace(/\/$/, ''),
    timeout,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
