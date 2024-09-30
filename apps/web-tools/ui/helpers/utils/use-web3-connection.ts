import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

function deferred() {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export const useWeb3Connection = () => {
  const connectWeb3Modal = useRef(deferred());

  const { open } = useWeb3Modal();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      connectWeb3Modal.current.resolve();
    }
  }, [isConnected]);

  return async () => {
    connectWeb3Modal.current = deferred(); // Reset the deferred object
    await open();
    await connectWeb3Modal.current.promise;
  };
};
