import BaseService from './base';
import { DEXTRADE_BASE_URL } from '../../../ui/helpers/constants/common';
import {
  HttpError,
  handleFetch,
} from '../../overrided-metamask/controller-utils';

class DextradeServiceApi extends BaseService {
  constructor({ getApiKey, refreshApiKey, signBody, verifyResponse } = {}) {
    const customHandleFetch = async (url, params) => {
      const isAuthRequest = params.headers['X-API-KEY'];
      if (isAuthRequest) {
        let body;
        const overridedParams = { ...params };
        if (['POST', 'PUT', 'DELETE'].includes(params.method)) {
          body = {
            ...(params.body ? JSON.parse(params.body) : {}),
            timestamp: new Date().getTime(),
          };
          body = JSON.stringify(body);
          overridedParams.headers.signature = await signBody(body);
          overridedParams.body = body;
        }

        const response = await fetch(url, overridedParams);
        const plainText = await response.text();
        let data;
        try {
          data = JSON.parse(plainText);
        } catch {
          data = plainText;
        }
        if (!response.ok) {
          console.error(response);
          const msg =
            data?.message ||
            data?.error ||
            `Failed authorized request with status '${response.status}' for request '${response.url}'`;
          throw new HttpError(response, msg, data);
        }
        const responseSignature = response.headers.get('signature');

        if (plainText) {
          const verified = await verifyResponse(plainText, responseSignature);
          if (!verified) {
            console.warn('Signature invalid', url, data);
          }
        }

        return data;
      }
      const { data: result } = await handleFetch(url, params);

      return result;
    };

    super({
      apiBaseUrl: `${DEXTRADE_BASE_URL}/`,
      getApiKey,
      refreshApiKey,
      customHandleFetch,
      aquire: true,
    });
  }

  /**
   * Returns api key for auth requests
   * @param mnemonicHash - mnemonic hash string of master private key
   * @param masterPublicKey - master private key
   * @param signature - signed session pub key
   * @param publicKey - session pub key hdWallet
   * @param deviceId
   */
  async login(mnemonicHash, masterPublicKey, signature, publicKey, deviceId) {
    return this.publicRequest('POST', 'public/auth', {
      mnemonicHash,
      masterPublicKey,
      signature,
      publicKey,
      deviceId,
    });
  }

  filterExchanges({ model, pagination }) {
    return this.request('POST', 'api/exchanger/filter', {
      ...model,
      ...pagination,
    });
  }

  clientExchangeStart(type, params) {
    return this.request('POST', `api/exchange/create/${type}`, params);
  }

  history(params) {
    return this.request('GET', 'api/exchange/history', null, params);
  }

  byId(id) {
    return this.request('GET', 'api/exchange/byId', null, { id });
  }

  exchangeApprove(isClient, isFiat, params) {
    const who = isClient ? 'client' : 'exchanger';
    const type = isFiat ? 'fiat' : 'crypto';
    return this.request('POST', `api/exchange/${who}/send/${type}`, params);
  }

  reserveAccept(exchangeId, amount) {
    return this.request('POST', 'api/exchange/exchanger/verify/reserve', {
      reserves: [
        {
          id: exchangeId,
          amount,
          isConfirmed: true,
        },
      ],
    });
  }

  reserveCancel(exchangeId) {
    return this.request('POST', 'api/exchange/exchanger/verify/reserve', {
      reserves: [
        {
          id: exchangeId,
          isConfirmed: false,
        },
      ],
    });
  }

  exchangerCurrentUser() {
    return this.request('GET', 'api/user/current');
  }

  exchangerCreate(data) {
    return this.request('POST', 'api/user/update', data);
  }

  paymentMethodIndex() {
    return this.request('GET', 'api/payment/methods');
  }

  paymentMethodCreateOrUpdate(data) {
    return this.request(data.id ? 'PUT' : 'POST', 'api/payment/methods', data);
  }

  paymentMethodDelete(id) {
    return this.request('POST', `api/payment/methods/delete`, { id });
  }

  userPaymentMethodsIndex() {
    return this.request('GET', 'api/payment/methods/by/user');
  }
}

export default DextradeServiceApi;
