import TronWeb from 'tronweb-fetch/dist/TronWeb';
import { SECOND } from '../../../../../shared/constants/time';

export default class TronBlockTracker {
  public readonly _client: typeof TronWeb;

  private eventListeners: { [eventName: string]: Function[] } = {};

  private latestBlockNumber = -1;

  private _pollingInterval: number;

  private intervalId: NodeJS.Timeout | null = null;

  constructor({
    client,
    pollingInterval,
  }: {
    client: typeof TronWeb;
    pollingInterval?: number;
  }) {
    this._client = client;
    this._pollingInterval = pollingInterval || 3 * SECOND;
    this.start();
  }

  public destroy() {
    this.end();
    // eslint-disable-next-line guard-for-in
    for (const eventName in this.eventListeners) {
      this.removeAllListeners(eventName);
    }
  }

  // Start periodic block tracking
  public start() {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        this.fetchAndTriggerLatestBlock();
      }, this._pollingInterval);
    }
  }

  // Stop periodic block tracking
  public end() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Add an event listener for a specific event
  public addListener(eventName: string, callback: Function) {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }

    this.eventListeners[eventName].push(callback);
  }

  public removeListener(eventName: string, callback: Function) {
    const listeners = this.eventListeners[eventName];
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  public removeAllListeners(eventName: string) {
    delete this.eventListeners[eventName];
  }

  // Trigger an event and notify all listeners
  private triggerEvent(eventName: string, data: any) {
    const listeners = this.eventListeners[eventName];
    if (listeners) {
      for (const listener of listeners) {
        listener(data);
      }
    }
  }

  async _newPotentialLatest(latestBlock: any) {
    const latestBlockNumber = latestBlock.number;
    if (latestBlockNumber > this.latestBlockNumber) {
      this.latestBlockNumber = latestBlockNumber;
      this.triggerEvent('latest', latestBlock);
    }
  }

  private async fetchAndTriggerLatestBlock() {
    try {
      const latestBlock = await this._client.trx.getBlock();
      console.log(latestBlock);
      this._newPotentialLatest(latestBlock);
    } catch (error) {
      console.error('Error fetching the latest block:', error);
    }
  }
}
