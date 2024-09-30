import { sha3_256 as hashF } from 'js-sha3';

function pbkdf2(password: string, rounds: number) {
  const passwordBuffer = new TextEncoder().encode(password);
  const salt = new TextEncoder().encode('mnemonic');

  return window.crypto.subtle
    .importKey('raw', passwordBuffer, 'PBKDF2', false, ['deriveBits'])
    .then((passwordKey) => {
      return window.crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt,
          iterations: rounds,
          hash: 'SHA-512',
        },
        passwordKey,
        512,
      );
    });
}

export default async function generateMnemonicHash(seedPhrase: string) {
  const result = await pbkdf2(seedPhrase, 2048);
  return hashF(result);
}
