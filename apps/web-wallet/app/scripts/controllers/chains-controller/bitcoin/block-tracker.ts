export default class BitcoinBlockTracker {
  async destroy(): Promise<void> {}

  isRunning(): boolean {
    return false;
  }

  getCurrentBlock(): string | null {
    return null;
  }

  async getLatestBlock(): Promise<string> {
    return '1231321';
  }

  removeAllListeners(eventName?: string | symbol): this {
    return this;
  }
}
