import { ISingleQuoteAPIData } from '../controllers/swaps/unizen/types';

class UnizenService {
  private readonly tokeApiKey: string = '89c99a8b-4afb-42c8-b7f0-4ca5fb779705';

  private readonly baseUrl: string = 'https://api.zcx.com';

  private readonly proxyUrl: string = 'https://1inch.dextrade.com/proxy/unizen';

  private readonly apiVersion: string = 'v1';

  private async requester(
    url: string,
    method: 'POST' | 'GET' = 'GET',
    body?: Record<string, unknown>,
  ) {
    const init: RequestInit = {
      method,
      headers: {
        'x-api-key': this.tokeApiKey,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    if (body) {
      init.body = JSON.stringify(body);
    }
    const response = await fetch(url, init);
    const result = await response.text();
    let data;
    try {
      data = JSON.parse(result);
    } catch {
      data = result;
    }
    if (!response.ok) {
      console.error(response);
      if ('message' in data) {
        try {
          const [code, ...split] = data.message.split(':');
          const msg = split.join(':');
          data = JSON.parse(msg)[0];
        } catch (e) {}
      }
      const msg =
        data?.error?.description ||
        data?.message ||
        data?.description ||
        data?.error;
      const defaultMessage = `Fetch failed with status '${response.status}' for request '${response.url}'`;
      throw new Error(msg || defaultMessage);
    }
    return data;
  }

  private async requestProxy(
    path: string,
    type: 'POST' | 'GET' = 'GET',
    body?: Record<string, unknown>,
  ) {
    const requestBody: {
      authorization: string;
      type: 'POST' | 'GET';
      path: string;
      body?: string;
    } = {
      authorization: this.tokeApiKey,
      type,
      path,
    };
    if (body && Boolean(Object.keys(body).length)) {
      requestBody.body = JSON.stringify(body);
    }
    return this.requester(this.proxyUrl, 'POST', requestBody);
  }

  private createQueryParam(params: Record<string, string>): string {
    if (!Object.keys(params).length) {
      return '';
    }
    const query = new URLSearchParams(params).toString();
    return `?${query}`;
  }

  private createUrl(chainId: number, method: string, query?: string): string {
    const url = this.baseUrl;
    const v = this.apiVersion;
    const chain = Number(chainId);
    const baseUrl = `${url}/trade/${v}/${chain}/${method}`;
    return query ? baseUrl.concat(query) : baseUrl;
  }

  public singleQuote<QuoteSingle extends ISingleQuoteAPIData>(
    params: { chainId: string } & Record<string, string>,
  ): Promise<QuoteSingle[]> {
    const { chainId, ...restParams } = params || {};
    const path = this.createUrl(
      Number(chainId),
      'quote/single',
      this.createQueryParam(restParams),
    );
    return this.requestProxy(path);
  }

  public crossQuote<QuoteCross>(
    params: {
      amount: string;
      fromTokenAddress: string;
      toTokenAddress: string;
      sourceChainId: string;
      destinationChainId: string;
      sender: string;
      receiver?: string;
    } & Record<string, string>,
  ): Promise<QuoteCross[]> {
    const { sourceChainId, ...restParams } = params || {};
    const path = this.createUrl(
      Number(sourceChainId),
      'quote/cross',
      this.createQueryParam(restParams),
    );
    return this.requestProxy(path);
  }

  public singleSwap(
    chainId: number | string,
    body: Record<string, unknown>,
  ): Promise<{
    contractVersion: string;
    data: string;
    estimateGas: string;
    estimateGasError: string;
    estimateGasRawError?: {
      details: string;
      shortMessage: string;
      cause: {
        details: string;
        shortMessage: string;
      };
    };
    nativeValue: string;
  }> {
    const path = this.createUrl(Number(chainId), 'swap/single');
    return this.requestProxy(path, 'POST', body);
  }

  public crossSwap(
    chainId: number | string,
    body: Record<string, unknown>,
  ): Promise<{
    contractVersion: string;
    data: string;
    estimateGas: string;
    estimateGasError: string;
    estimateGasRawError?: {
      details: string;
      shortMessage: string;
      cause: {
        details: string;
        shortMessage: string;
      };
    };
    nativeValue: string;
  }> {
    const path = this.createUrl(Number(chainId), 'swap/cross');
    return this.requestProxy(path, 'POST', body);
  }

  public approvalAllowance(params: {
    tokenAddress: string;
    walletAddress: string;
    contractVersion: string;
    chainId: string;
  }): Promise<{
    allowance: string;
  }> {
    const path = this.createUrl(
      Number(params.chainId),
      'approval/allowance',
      this.createQueryParam(params),
    );
    return this.requestProxy(path);
  }

  public approvalTransaction(params: {
    tokenAddress: string;
    walletAddress: string;
    contractVersion: string;
    chainId: string;
    amount?: string;
  }): Promise<{
    data: string;
    to: string;
    value: string;
    gasPrice: string;
  }> {
    const path = this.createUrl(
      Number(params.chainId),
      'approval/transaction',
      this.createQueryParam(params),
    );
    return this.requestProxy(path);
  }

  public inboundAddresses() {
    const path = `${this.baseUrl}/trade/info/thorchain-inbound-address`;
    return this.requestProxy(path);
  }
}

export default UnizenService;
