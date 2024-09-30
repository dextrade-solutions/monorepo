import { Buffer } from 'buffer';

window.global ||= window;

global.Buffer = Buffer;
global.platform = {
  getVersion() {
    return process.env.APP_VERSION;
  },
  openTab({ url }) {
    if (url) {
      window.open(url);
    }
  },
  closeCurrentWindow() {
    window.close();
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showTransactionNotification(tx) {
    // TODO: Imlement notifications in web
  },

  getPlatformInfo(cb) {
    try {
      const { userAgent } = navigator;
      cb({ userAgent });
      return;
    } catch (e) {
      cb(e);
      // eslint-disable-next-line no-useless-return
      return;
    }
  },
};
