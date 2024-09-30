// DEPRECATED

import { BN } from 'ethjs';

import { stringifyBalance } from './util';
/**
 * Checks whether the given input and base will produce an invalid bn instance.
 *
 * bn.js requires extra validation to safely use, so this function allows
 * us to typecheck the params we pass to it.
 *
 * @see {@link https://github.com/indutny/bn.js/issues/151}
 * @param {any} input - the bn.js input
 * @param {number} base - the bn.js base argument
 * @returns {boolean}
 */
function _isInvalidBnInput(input, base) {
  return (
    typeof input === 'string' &&
    (input.startsWith('0x') || Number.isNaN(parseInt(input, base)))
  );
}

class Token {
  constructor({
    provider,
    symbol,
    balance,
    owner,
    throwOnBalanceError,
    balanceDecimals,
    image,
  } = {}) {
    if (!owner) {
      throw new Error("Missing requried 'owner' parameter");
    }
    this.isLoading = !owner || !symbol || !balance;
    this.symbol = symbol;
    this.provider = provider;
    this.throwOnBalanceError = throwOnBalanceError;
    this.balanceDecimals = balanceDecimals;

    if (!balance) {
      balance = new BN(0);
    } else if (_isInvalidBnInput(balance, 16)) {
      throw new Error(
        "Invalid 'balance' option provided; must be non-prefixed hex string if given as string",
      );
    }

    this.balance = balance;
    this.owner = owner;
    this.contract = this.provider.contract;
    this.image = image;
  }

  async update() {
    await Promise.all([
      this.symbol || this.updateSymbol(),
      // this.updateBalance(),
      this.decimals || this.updateDecimals(),
    ]);
    this.isLoading = false;
    return this.serialize();
  }

  serialize() {
    return {
      owner: this.owner,
      provider: this.provider,
      contract: this.contract,
      symbol: this.symbol,
      balance: this.balance.toString(),
      decimals: this.decimals ? parseInt(this.decimals.toString(), 10) : 0,
      string: this.stringify(),
      image: this.image,
      balanceError: this.balanceError ? this.balanceError : null,
    };
  }

  stringify() {
    const balance = stringifyBalance(
      this.balance,
      this.decimals || new BN(0),
      this.balanceDecimals,
    );
    return balance;
  }

  async updateSymbol() {
    const symbol = await this.updateValue('symbol');
    this.symbol = symbol || 'TKN';
    return this.symbol;
  }

  async updateBalance() {
    const balance = await this.updateValue('balance');
    this.balance = balance;
    return this.balance;
  }

  async updateDecimals() {
    if (this.decimals !== undefined) {
      return this.decimals;
    }
    const decimals = await this.updateValue('decimals');
    if (decimals) {
      this.decimals = decimals;
    }
    return this.decimals;
  }

  async chainBalanceSync() {
    this.balanceError = null;
    try {
      const balance = await this.chainProvider.getBalance(this.owner);
      return balance;
    } catch (e) {
      this.balanceError = e;
      if (this.throwOnBalanceError) {
        throw e;
      }
    }
    return null;
  }

  async updateValue(key) {
    let methodName;

    switch (key) {
      case 'balance': {
        const balance = await this.chainBalanceSync(this.provider.chainId);
        if (balance) {
          this.balance = balance;
          return this.balance;
        }
        break;
      }
      default:
        methodName = key;
    }

    if (this.contract) {
      let result;
      try {
        result = await this.contract[methodName]();
      } catch (e) {
        console.warn(`failed to load ${key} for token at ${this.address}`);
      }

      if (result) {
        const val = result[0];
        this[key] = val;
        return val;
      }
    }

    return this[key];
  }
}

export default Token;
