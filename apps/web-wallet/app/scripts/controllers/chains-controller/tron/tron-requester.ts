import TronWeb from 'tronweb-fetch/dist/TronWeb';
import getFetchWithTimeout from '../../../../../shared/modules/fetch-with-timeout';
import { ResponseTRC20TxData, ResponseTRXTxData, TGetAccount } from './types';

const fetchWithTimeout = getFetchWithTimeout();

interface IConstructor {
  client: typeof TronWeb;
  getAccount: TGetAccount;
}

export class TronRequester {
  private readonly _client: typeof TronWeb;

  private readonly _host: string;

  private readonly getAccount: TGetAccount;

  constructor({ client, getAccount }: IConstructor) {
    this._client = client;
    this._host = client.fullNode.host;
    this.getAccount = getAccount;
  }

  public get client(): typeof TronWeb {
    return this._client;
  }

  public get host(): string {
    return this._host;
  }

  public get address(): string {
    return this.getAccount().nativeAddress;
  }

  private generateQuery(data: any) {
    const query = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        query.append(key, String(value));
      }
    });
    return query;
  }

  private generateTRXUrl(): string {
    const query = this.generateQuery({
      only_confirmed: true,
      only_to: true,
      limit: 5,
      // min_timestamp: fromTimestamp,
    });
    return `${this.host}/v1/accounts/${
      this.address
    }/transactions?${query.toString()}`;
  }

  private generateTRC20Url(): string {
    const query = this.generateQuery({
      only_confirmed: true,
      only_to: true,
      // min_timestamp: fromTimestamp,
      limit: 5,
    });
    return `${this.host}/v1/accounts/${
      this.address
    }/transactions/trc20?${query.toString()}`;
  }

  private async fetch<T>(url: string | null): Promise<T[]> {
    if (!url) {
      return [];
    }

    try {
      const options = {
        method: 'GET',
        headers: { accept: 'application/json' },
      };
      const response = await fetchWithTimeout(url, options);
      const { data } = await response.json();
      return data;
    } catch (err) {
      console.error('err', err);
      return [];
    }
  }

  public async getTRC20IncomeTransactions() {
    const data = await this.fetch<ResponseTRC20TxData>(this.generateTRC20Url());
    return data.filter((tx) => tx.to === this._client.defaultAddress.base58);
  }

  public async getTRXIncomeTransactions(): Promise<ResponseTRXTxData[]> {
    const data = await this.fetch<ResponseTRXTxData>(this.generateTRXUrl());
    return data.filter(
      (tx) =>
        tx.raw_data.contract[0].parameter.value.to_address ===
        this._client.defaultAddress.hex,
    );
  }
}
