export enum TransactionType {
  /**
   * A transaction submitted with the same nonce as a previous transaction, a
   * higher gas price and a zeroed out send amount. Useful for users who
   * accidentally send to erroneous addresses or if they send too much.
   */
  cancel = 'cancel',
  /**
   * A transaction that is interacting with a smart contract's methods that we
   * have not treated as a special case, such as approve, transfer, and
   * transferfrom
   */
  contractInteraction = 'contractInteraction',
  /**
   * A transaction that deployed a smart contract
   */
  deployContract = 'contractDeployment',
  ethDecrypt = 'eth_decrypt',
  ethGetEncryptionPublicKey = 'eth_getEncryptionPublicKey',
  /**
   * An incoming (deposit) transaction
   */
  incoming = 'incoming',
  personalSign = 'personal_sign',
  /**
   * When a transaction is failed it can be retried by
   * resubmitting the same transaction with a higher gas fee. This type is also used
   * to speed up pending transactions. This is accomplished by creating a new tx with
   * the same nonce and higher gas fees.
   */
  retry = 'retry',
  sign = 'eth_sign',
  signTypedData = 'eth_signTypedData',
  /** A transaction sending a network's native asset to a recipient */
  simpleSend = 'simpleSend',
  smart = 'smart',
  multisignerSimpleSend = 'multisignerSimpleSend',
  multisignerSmartSend = 'multisignerSmartSend',
  /**
   * A transaction swapping one token for another
   */
  swap = 'swap',
  /**
   * Similar to the approve type, a swap approval is a special case of ERC20
   * approve method that requests an allowance of the token to spend on behalf
   * of the user for the MetaMask Swaps contract. The first swap for any token
   * will have an accompanying swapApproval transaction.
   */
  swapApproval = 'swapApproval',
  /**
   * A token transaction requesting an allowance of the token to spend on
   * behalf of the user
   */
  tokenMethodApprove = 'approve',
  /**
   * A token transaction transferring tokens from an account that the sender
   * has an allowance of. The method is prefixed with safe because when calling
   * this method the contract checks to ensure that the receiver is an address
   * capable of handling with the token being sent.
   */
  tokenMethodSafeTransferFrom = 'safetransferfrom',
  /**
   * A token transaction where the user is sending tokens that they own to
   * another address
   */
  tokenMethodTransfer = 'transfer',
  /**
   * A token transaction transferring tokens from an account that the sender
   * has an allowance of. For more information on allowances, see the approve
   * type.
   */
  tokenMethodTransferFrom = 'transferfrom',
  /**
   * A token transaction requesting an allowance of all of a user's token to
   * spend on behalf of the user
   */
  tokenMethodSetApprovalForAll = 'setapprovalforall',
}

/**
 * The types of assets that a user can send
 *
 * @type {AssetTypes}
 */
export enum AssetType {
  /** The native asset for the current network, such as ETH */
  native = 'NATIVE',
  /** An ERC20 token */
  token = 'TOKEN',
  /** An ERC721 or ERC1155 token. */
  NFT = 'NFT',
  /** Asset multisign address */
  multisign = 'MULTISIGN',
  /**
   * A transaction interacting with a contract that isn't a token method
   * interaction will be marked as dealing with an unknown asset type.
   */
  unknown = 'UNKNOWN',
}

/**
 * Transaction Status is a mix of Ethereum and MetaMask terminology, used internally
 * for transaction processing.
 */
export enum TransactionStatus {
  /**
   * A new transaction that the user has not approved or rejected
   */
  unapproved = 'unapproved',
  /**
   * The user has approved the transaction in the MetaMask UI
   */
  approved = 'approved',
  /**
   * The user has rejected the transaction in the MetaMask UI
   */
  rejected = 'rejected',
  /**
   * The transaction has been signed
   */
  signed = 'signed',
  /**
   * The transaction has been submitted to network
   */
  submitted = 'submitted',
  /**
   * The transaction has failed for some reason
   */
  failed = 'failed',
  /**
   * The transaction was dropped due to a tx with same nonce being accepted
   */
  dropped = 'dropped',
  /**
   * The transaction was confirmed by the network
   */
  confirmed = 'confirmed',
  /**
   * The transaction was expired (for p2p transaction)
   */
  expired = 'expired',
  /**
   * The transaction has been signed and is waiting to either be confirmed,
   * dropped or failed. This is a "fake" status that we use to group statuses
   * that are very similar from the user's perspective (approved,
   * signed, submitted). The only notable case where approve and signed are
   * different from user perspective is in hardware wallets where the
   * transaction is signed on an external device. Otherwise signing happens
   * transparently to users.
   */
  pending = 'pending',
}
