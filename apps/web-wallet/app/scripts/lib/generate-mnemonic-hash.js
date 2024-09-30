import { sha3_256 } from 'js-sha3';

function pbkdf2(password, rounds) {
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

export default async function generateMnemonicHash(seedPhrase) {
  const result = await pbkdf2(seedPhrase, 2048);
  return sha3_256(result);
}
