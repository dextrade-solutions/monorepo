import type { AfterResponseHook } from 'ky';

export type QueryOptions = {
  afterResponse: AfterResponseHook;
};

export type Theme = 'dark' | 'light';

export type Mode = 'light' | 'advanced';
