declare global {
  interface Window {
    trustwallet?: any;
    ethereum?: any;
  }
}

export function getTrustWalletProvider(): any | undefined {
  const isTrustWallet = (ethereum: NonNullable<Window['ethereum']>) => {
    // Identify if Trust Wallet injected provider is present.
    const trustWallet = Boolean(ethereum.isTrust);

    return trustWallet;
  };

  const injectedProviderExist =
    typeof window !== 'undefined' &&
    window !== null &&
    typeof window.ethereum !== 'undefined' &&
    window.ethereum !== null;

  // No injected providers exist.
  if (!injectedProviderExist) {
    return;
  }

  // Trust Wallet was injected into window.ethereum.
  if (isTrustWallet(window.ethereum as NonNullable<Window['ethereum']>)) {
    return window.ethereum;
  }

  let trustWalletProvider;

  if (window.ethereum?.providers?.length) {
    // Trust Wallet provider might be replaced by another
    // injected provider, check the providers array.
    trustWalletProvider = window.ethereum.providers.find(
      (provider: any) => provider && isTrustWallet(provider),
    );
  }

  if (!trustWalletProvider) {
    // In some cases injected providers can replace window.ethereum
    // without updating the providers array. In those instances the Trust Wallet
    // can be installed and its provider instance can be retrieved by
    // looking at the global `trustwallet` object.
    trustWalletProvider = window.trustwallet;
  }

  return trustWalletProvider;
}
