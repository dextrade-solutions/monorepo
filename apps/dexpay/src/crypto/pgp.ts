import { encrypt, createMessage, readKey } from 'openpgp';

export namespace PGP {
  export async function encryptMessage(text: string, publicKey: string) {
    const [message, key] = await Promise.all([
      createMessage({ text }),
      readKey({ armoredKey: publicKey }),
    ]);
    const encrypted = await encrypt({ message, encryptionKeys: key });
    return encrypted as string;
  }
}
