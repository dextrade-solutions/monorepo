import BaseService from './base';

// const DEFAULT_URL = 'http://65.108.199.217:8084/';
const DEFAULT_URL = 'https://multi-sig.dextrade.com/';

class MultisignerServiceApi extends BaseService {
  constructor({ getMnemonicHash }) {
    super({
      apiBaseUrl: DEFAULT_URL,
      getApiKey: getMnemonicHash,
      authHeader: 'mnemonicHash',
    });
    this.getMnemonicHash = getMnemonicHash;
  }

  /**
   * Decline transaction
   *
   * @param {string} txId - transaction id
   */
  transactionDecline(txId) {
    return this.request('POST', 'transaction/decline', null, {
      transactionId: txId,
    });
  }

  /**
   * Sign transaction
   *
   * @param {string} transactionId - transaction id
   * @param {Array<string>} signedTransactions - signed
   */
  transactionSign(transactionId, signedTransactions) {
    return this.request('POST', 'transaction/sign', signedTransactions, {
      transactionId,
    });
  }

  /**
   * All created transactions
   *
   * @param {string} addressId - multisign address
   */
  transactionIndex(addressId) {
    return this.request('GET', 'transaction', null, { addressId });
  }

  /**
   * All created transactions by status
   *
   * @param {string} status - tx status
   */
  transactionIndexByStatus(status) {
    return this.request('GET', 'transaction/by/status', null, { status });
  }

  /**
   * Get transaction by id
   *
   * @param {string} id - tx status
   */
  async transactionById(id) {
    return this.request('GET', 'transaction/byId', null, { id });
  }

  /**
   * Get all transactions
   */
  async transactionsAll() {
    return this.request('GET', 'transaction/all', null);
  }

  /**
   * Get transaction weight
   *
   * @param payloads
   * @param {string} payloads.addressId - multisign address
   * @param {string} payloads.amount - send amount
   * @param {string} payloads.toAddress - address to send
   */
  async transactionWeight(payloads) {
    return this.request('GET', 'transaction/weight', null, { ...payloads });
  }

  /**
   * Create transaction
   *
   * @param payloads
   * @param {string} payloads.addressId - multisign address
   * @param {string} payloads.amount - send amount
   * @param {string} payloads.toAddress - address to send
   * @param {number} payloads.fee - transaction weight
   */
  async transactionCreate(payloads) {
    return this.request('POST', 'transaction/create', null, { ...payloads });
  }

  /**
   * Create multisign address
   *
   * @param payloads
   * @param payloads.of - all signatures
   * @param payloads.out - minimum signatures
   * @param payloads.pubKey - user signature
   */
  async addressCreate(payloads) {
    return this.request('POST', 'address/create', payloads);
  }

  /**
   * User multisign addresses
   */
  addressIndex() {
    return this.request('GET', 'address');
  }

  /**
   * Add signature
   *
   * @param payloads
   * @param payloads.id - id of address
   * @param payloads.pubKey - signature
   * @returns
   */
  addressAddSign(payloads) {
    return this.request('POST', 'address/sign/add', payloads);
  }

  /**
   * Delete address
   *
   * @param id -id of address
   * @returns
   */
  deleteAddress(id) {
    return this.request('DELETE', 'address', null, { id });
  }
}

export default MultisignerServiceApi;
