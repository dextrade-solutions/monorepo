class OneInchService {
  private readonly tokeApiKey: string = 'ElyK7s22HR0JD78CEXVPnpZA8UyuUwIl';

  private readonly baseUrl: string = 'https://api.1inch.dev/swap';

  private readonly apiVersion: string = 'v5.2';

  private readonly apiUrl: string = 'https://1inch.dextrade.com/proxy/one-inch';

  private async requester(url: string, body: string) {
    const response = await fetch(url, {
      method: 'POST',
      body,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
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
      const msg = data?.message || data?.description || data?.error;
      const defaultMessage = `Fetch failed with status '${response.status}' for request '${response.url}'`;
      throw new Error(msg || defaultMessage);
    }
    return data;
  }

  private generateBodyParams(
    method: string,
    params: Record<string, string | number>,
  ): string {
    const query = new URLSearchParams(params).toString();
    return JSON.stringify({
      query: `?${query}`,
      baseUrl: this.baseUrl,
      type: 'GET',
      method,
      authorization: this.tokeApiKey,
    });
  }

  private generateUrl(chainId: string): string {
    return `${this.apiUrl}/${this.apiVersion}/${Number(chainId)}`;
  }

  public async getQuote(chainId: string, params = {}) {
    const url = this.generateUrl(chainId);
    const body = this.generateBodyParams('quote', params);
    return this.requester(url, body);
  }

  public async getAllowance(chainId: string, params = {}) {
    const url = this.generateUrl(chainId);
    const body = this.generateBodyParams('approve/allowance', params);
    return this.requester(url, body);
  }

  public async approveTransaction(chainId: string, params = {}) {
    const url = this.generateUrl(chainId);
    const body = this.generateBodyParams('approve/transaction', params);
    return this.requester(url, body);
  }

  public async swap(chainId: string, params = {}) {
    const url = this.generateUrl(chainId);
    const body = this.generateBodyParams('swap', params);
    return this.requester(url, body);
  }
}

export default OneInchService;
