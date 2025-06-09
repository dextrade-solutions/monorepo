// Типы для мапы запросов
interface RequestMap {
  [requestId: string]: {
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  };
}

const requestMap: RequestMap = {};
let requestCounter = 0;

export const WebViewBridge = {
  // Отправка запроса в native с ожиданием ответа
  sendToNative(event: string, data: any): Promise<any> {
    const requestId = `req_${Date.now()}_${requestCounter++}`;
    const payload = JSON.stringify({ event, data, requestId });

    return new Promise((resolve, reject) => {
      requestMap[requestId] = { resolve, reject };

      // Android
      if (window.Android?.postMessage) {
        window.Android.postMessage(payload);
      }
      // iOS
      else if (window.webkit?.messageHandlers?.productHandler) {
        window.webkit.messageHandlers.productHandler.postMessage(payload);
      } else {
        reject('No native bridge available');
      }

      // Таймаут (опционально)
      setTimeout(() => {
        if (requestMap[requestId]) {
          delete requestMap[requestId];
          reject('Timeout waiting for native response');
        }
      }, 5000);
    });
  },

  // Обработка ответа от native-приложения
  onReceiveFromNative(payload: any) {
    try {
      const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
      const { requestId, result, error } = data;
      const pending = requestMap[requestId];

      if (pending) {
        if (error) {
          pending.reject(error);
        } else {
          pending.resolve(result);
        }
        delete requestMap[requestId];
      }
    } catch (err) {
      console.error('Failed to handle native response', err);
    }
  },
};

// Установка глобальной функции, которую вызовет native
if (typeof window !== 'undefined') {
  (window as any).receiveDataFromApp = WebViewBridge.onReceiveFromNative;
}
