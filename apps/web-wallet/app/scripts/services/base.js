import { isUndefined, omitBy } from 'lodash';

import {
  HttpError,
  handleFetch,
} from '../../overrided-metamask/controller-utils';

const DEFAULT_AUTH_HEADER = 'X-API-KEY';

export default class BaseServiceApi {
  controllers = new Map();

  constructor({
    apiBaseUrl,
    getApiKey,
    refreshApiKey,
    authHeader,
    customHandleFetch,
    aquire,
  } = {}) {
    this.apiBaseUrl = apiBaseUrl;
    this.getApiKey = getApiKey;
    this.authHeader = authHeader || DEFAULT_AUTH_HEADER;
    this.handleFetch = customHandleFetch || handleFetch;
    this.aquire = aquire;
    this.refreshApiKey = refreshApiKey;
  }

  _makeUrl(url, query) {
    const queryString = new URLSearchParams(
      omitBy(query, isUndefined),
    ).toString();
    const urlPath = `${this.apiBaseUrl}${url}`;
    return queryString ? `${urlPath}?${queryString}` : urlPath;
  }

  /**
   * abort all requester controllers
   */
  abort() {
    [...this.controllers].forEach(([_, c]) => {
      if (!c) {
        return;
      }
      c.abort();
    });
  }

  /**
   * Handle fetch with abort controller
   *
   * @param request - The request information.
   * @param options - The fetch options.
   * @returns The fetch response JSON data.
   */
  async requester(request = '', options = {}) {
    const controller = new AbortController();
    const { signal } = controller;
    // eslint-disable-next-line no-plusplus
    const id = `${this.controllers.size}-${Number(new Date())}`;
    this.controllers.set(id, controller);
    try {
      const data = await this.handleFetch(request, { ...options, signal });
      this.controllers.delete(id);
      return data;
    } catch (err) {
      this.controllers.delete(id);
      throw err;
    }
  }

  // Public request method
  async publicRequest(method, url, data, query) {
    return this.requester(this._makeUrl(url, query), {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Auhtorized request method
  async request(method, url, data, query) {
    try {
      const resp = await this.requester(this._makeUrl(url, query), {
        method,
        headers: {
          'Content-Type': 'application/json',
          [this.authHeader]: this.getApiKey(),
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      return resp;
    } catch (e) {
      if (e instanceof HttpError && e.code === 401 && this.refreshApiKey) {
        await this.refreshApiKey();
      }
      throw e;
    }
  }
}
