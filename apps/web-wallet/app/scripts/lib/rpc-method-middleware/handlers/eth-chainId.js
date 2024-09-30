import { MESSAGE_TYPE } from '../../../../../shared/constants/app';

const requestChainId = {
  methodNames: [MESSAGE_TYPE.ETH_CHAIN_ID],
  implementation: requestChainIdHandler,
  hookNames: {
    getCurrentChainId: true,
  },
};
export default requestChainId;

/**
 *
 * @param {import('json-rpc-engine').JsonRpcRequest<unknown>} _req - The JSON-RPC request object.
 * @param {import('json-rpc-engine').JsonRpcResponse<true>} res - The JSON-RPC response object.
 * @param {Function} _next - The json-rpc-engine 'next' callback.
 * @param {Function} end - The json-rpc-engine 'end' callback.
 * @param {EthAccountsOptions} options - The RPC method hooks.
 */
async function requestChainIdHandler(
  _req,
  res,
  _next,
  end,
  { getCurrentChainId },
) {
  res.result = getCurrentChainId();
  return end();
}
