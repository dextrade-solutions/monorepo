type TConsumer = () => Promise<unknown> | unknown;

const DEFAULT_POLLING_TIMEOUT = 5000;

export class PollingController extends EventTarget {
  private interval: ReturnType<typeof setInterval> | null = null;

  private pollingTimeout = DEFAULT_POLLING_TIMEOUT;

  private _lastPolling = 0;

  private readonly consumer: TConsumer;

  private isPause = false;

  private isStarted = false;

  constructor({
    timeout = DEFAULT_POLLING_TIMEOUT,
    consumer,
  }: {
    timeout?: number;
    consumer: TConsumer;
  }) {
    super();
    this.consumer = consumer;
    this.pollingTimeout = timeout;
  }

  public get lastPolling(): number {
    return this._lastPolling;
  }

  private setLastPolling(set: number = this.datetime) {
    this._lastPolling = set;
  }

  private get datetime(): number {
    return Number(new Date());
  }

  private async pollingConsumer() {
    if (!this.isStarted) {
      return null;
    }
    const isTime = this.pollingTimeout + this.lastPolling > this.datetime;
    try {
      if (isTime || this.isPause) {
        return null;
      }
      this.isPause = true;
      const data = await this.consumer?.();
      this.setLastPolling(this.datetime);
      return data;
    } catch (err) {
      if (err instanceof Error) {
        console.error(err?.message);
      }
      return err;
    } finally {
      this.isPause = false;
    }
  }

  private clearPollingInterval() {
    if (!this.interval) {
      return;
    }
    clearInterval(this.interval);
  }

  private createPollingTracker() {
    this.interval = setInterval(async () => {
      await this.pollingConsumer();
    }, 1000);
  }

  public async pull() {
    this.isPause = true;
    await this.consumer?.();
    this.setLastPolling();
    this.isPause = false;
  }

  public stop() {
    this.isStarted = false;
    this.setLastPolling(0);
    this.pollingTimeout = DEFAULT_POLLING_TIMEOUT;
    this.clearPollingInterval();
  }

  public async start() {
    if (this.isStarted) {
      return;
    }
    this.stop();
    this.isStarted = true;
    this.isPause = false;
    if (!this.lastPolling) {
      await this.pollingConsumer();
    }
    this.createPollingTracker();
  }
}
