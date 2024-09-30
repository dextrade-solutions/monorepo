type TConsumer = (() => boolean) | null;
type TDispatcher = (() => Promise<void>) | null;

const DEFAULT_POLLING_TIMEOUT = 5000;

export class PollingBalanceTracker extends EventTarget {
  private interval: ReturnType<typeof setInterval> | null = null;

  private pollingTimeout = DEFAULT_POLLING_TIMEOUT;

  private _lastPolling = 0;

  private readonly consumer: TConsumer = null;

  private readonly dispatcher: TDispatcher = null;

  private _balance: number | undefined;

  constructor({
    timeout = DEFAULT_POLLING_TIMEOUT,
    consumer,
    dispatcher,
  }: {
    timeout?: number;
    consumer: TConsumer;
    dispatcher: TDispatcher;
  }) {
    super();
    this.consumer = consumer;
    this.dispatcher = dispatcher;
    this.pollingTimeout = timeout;
  }

  public get balance(): number {
    return this._balance || -1;
  }

  public setBalance(balance: number) {
    this._balance = balance;
  }

  public get lastPolling(): number {
    return this._lastPolling;
  }

  private getTime(): number {
    return Number(new Date());
  }

  private clearPollingInterval() {
    if (!this.interval) {
      return;
    }
    clearInterval(this.interval);
  }

  private createPollingTracker() {
    this.interval = setInterval(async () => {
      if (this.pollingTimeout + this._lastPolling > this.getTime()) {
        return;
      }
      if (this.consumer && !this.consumer()) {
        return;
      }
      await this.dispatcher?.();
      this._lastPolling = this.getTime();
    }, 2000);
  }

  public stop() {
    this._lastPolling = 0;
    this.pollingTimeout = DEFAULT_POLLING_TIMEOUT;
    this._balance = undefined;
    this.clearPollingInterval();
  }

  public async start() {
    this.stop();
    if (this.dispatcher && !this._lastPolling) {
      await this.dispatcher();
      this._lastPolling = this.getTime();
    }
    this.createPollingTracker();
  }

  public restart(timeout?: number) {
    this.clearPollingInterval();
    this.pollingTimeout = timeout || DEFAULT_POLLING_TIMEOUT;
    this.createPollingTracker();
  }
}
