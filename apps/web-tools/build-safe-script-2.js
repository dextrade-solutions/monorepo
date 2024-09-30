import * as bitcoin from 'bitcoinjs-lib';
import crypto from 'crypto';

class RedeemTransactionBuilder {
  constructor(bitcoinKit, scriptBuilder) {
    this.bitcoinKit = bitcoinKit;
    this.scriptBuilder = scriptBuilder;
  }

  async sendRedeemTx(
    redeemPKH,
    redeemPKId,
    secret,
    secretHash,
    refundPKH,
    refundTime,
    bailTx,
  ) {
    // Retrieve the public key
    let publicKey = this.bitcoinKit.getPublicKeyByPath(redeemPKId);
    if (publicKey.path !== redeemPKId) {
      publicKey = this.bitcoinKit.getPublicKeyByPath(publicKey.path);
    }
    console.log('SwapKit', 'feeRate', this.feeRate());

    // Construct the bail output information
    const bailOutput = {
      value: bailTx.amount,
      index: bailTx.outputIndex,
      script: bailTx.lockingScript,
      type: 'P2SH', // Pay-to-Script-Hash (P2SH)
      lockingScriptPayload: bailTx.scriptHash,
      transactionHash: bailTx.txHash,
    };

    // Create the redeem script
    const redeemScript = this.scriptBuilder.bailScript(
      redeemPKH,
      secretHash,
      refundPKH,
      refundTime,
    );
    bailOutput.redeemScript = redeemScript;

    // Signature script function using BitcoinJS
    const signatureScriptFunction = (signatures) => {
      signatures.forEach((sig) => {
        console.log('SwapKit', 'sign', sig.toString('hex'));
      });

      return bitcoin.script.compile([
        bitcoin.script.signature.encode(
          signatures[0],
          bitcoin.Transaction.SIGHASH_ALL,
        ),
        bitcoin.script.signature.encode(
          signatures[1],
          bitcoin.Transaction.SIGHASH_ALL,
        ),
        secret,
        bitcoin.opcodes.OP_1,
        redeemScript,
      ]);
    };

    // Use BitcoinJS library to create and sign the transaction
    const psbt = new bitcoin.Psbt(); // Create a new Partially Signed Bitcoin Transaction (PSBT)

    // Add the input (UTXO) from the bail transaction
    psbt.addInput({
      hash: bailTx.txHash,
      index: bailTx.outputIndex,
      witnessUtxo: {
        script: bailTx.lockingScript,
        value: bailTx.amount,
      },
      redeemScript,
    });

    // Specify the destination address and amount
    psbt.addOutput({
      address: this.bitcoinKit.receiveAddress(),
      value: bailTx.amount - this.feeRate(), // Subtract the fee from the amount
    });

    // Sign the transaction using the appropriate key
    const keyPair = bitcoin.ECPair.fromPublicKey(publicKey);
    psbt.signInput(0, keyPair);

    // Finalize the transaction
    psbt.finalizeAllInputs();

    // Extract the final transaction in hex format
    const transactionHex = psbt.extractTransaction().toHex();

    // Return the transaction details
    return new BitcoinRedeemTx(transactionHex, secret);
  }

  feeRate() {
    // Implement your fee rate logic here, for example, return 10 satoshis per byte
    return 10;
  }
}

// Usage Example

const bitcoinKit = {
  getPublicKeyByPath: (path) => {
    // Replace this with your method of getting a public key by path
    return {
      path,
      publicKey: Buffer.from('YOUR_PUBLIC_KEY', 'hex'),
    };
  },
  receiveAddress: () => 'YOUR_RECEIVING_ADDRESS',
};

const scriptBuilder = {
  bailScript: (redeemPKH, secretHash, refundPKH, refundTime) => {
    // Replace with the actual bail script logic as provided earlier
    return bitcoin.script.compile([
      bitcoin.opcodes.OP_IF,
      bitcoin.opcodes.OP_SHA256,
      secretHash,
      bitcoin.opcodes.OP_EQUALVERIFY,
      redeemPKH,
      bitcoin.opcodes.OP_CHECKSIG,
      bitcoin.opcodes.OP_ELSE,
      bitcoin.script.number.encode(refundTime),
      bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
      bitcoin.opcodes.OP_DROP,
      refundPKH,
      bitcoin.opcodes.OP_CHECKSIG,
      bitcoin.opcodes.OP_ENDIF,
    ]);
  },
};

// Assume you have a bailTx object available
const bailTx = {
  amount: 100000, // example amount in satoshis
  outputIndex: 0,
  lockingScript: Buffer.from('YOUR_LOCKING_SCRIPT', 'hex'),
  scriptHash: Buffer.from('YOUR_SCRIPT_HASH', 'hex'),
  txHash: 'YOUR_TRANSACTION_HASH',
};

const redeemPKH = Buffer.from(
  '76a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac',
  'hex',
);
const secret = Buffer.from('YOUR_SECRET', 'hex');
const secretHash = crypto.createHash('sha256').update(secret).digest();
const refundPKH = Buffer.from(
  '76a9140123456789abcdef0123456789abcdef0123456788ac',
  'hex',
);
const refundTime = 500000;

const redeemTransactionBuilder = new RedeemTransactionBuilder(
  bitcoinKit,
  scriptBuilder,
);
redeemTransactionBuilder
  .sendRedeemTx(
    redeemPKH,
    'path/to/redeemPKId',
    secret,
    secretHash,
    refundPKH,
    refundTime,
    bailTx,
  )
  .then((redeemTx) => {
    console.log('Redeem Transaction:', redeemTx);
  })
  .catch((error) => console.error(error));
