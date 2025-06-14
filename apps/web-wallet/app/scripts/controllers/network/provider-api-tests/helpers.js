// import nock from 'nock';
import sinon from 'sinon';
import { JsonRpcEngine } from 'json-rpc-engine';
import { providerFromEngine } from '@metamask/eth-json-rpc-middleware';
import EthQuery from 'eth-query';
import createInfuraClient from '../createInfuraClient';
import createJsonRpcClient from '../createJsonRpcClient';
import { CHAIN_ID_TO_RPC_URL_MAP } from '../../../../../shared/constants/network';

/**
 * @typedef {import('nock').Scope} NockScope
 *
 * A object returned by the `nock` function for mocking requests to a particular
 * base URL.
 */

/**
 * @typedef {{blockTracker: import('eth-block-tracker').PollingBlockTracker, clock: sinon.SinonFakeTimers, makeRpcCall: (request: Partial<JsonRpcRequest>) => Promise<any>, makeRpcCallsInSeries: (requests: Partial<JsonRpcRequest>[]) => Promise<any>}} Client
 *
 * Provides methods to interact with the suite of middleware that
 * `createInfuraClient` or `createJsonRpcClient` exposes.
 */

/**
 * @typedef {{providerType: "infura" | "custom", infuraNetwork?: string, customRpcUrl?: string, customChainId?: string}} WithClientOptions
 *
 * The options bag that `withNetworkClient` takes.
 */

/**
 * @typedef {(client: Client) => Promise<any>} WithClientCallback
 *
 * The callback that `withNetworkClient` takes.
 */

/**
 * @typedef {{ nockScope: NockScope, blockNumber: string }} MockBlockTrackerRequestOptions
 *
 * The options to `mockNextBlockTrackerRequest` and `mockAllBlockTrackerRequests`.
 */

/**
 * @typedef {{ nockScope: NockScope, request: object, response: object, delay?: number }} MockRpcCallOptions
 *
 * The options to `mockRpcCall`.
 */

/**
 * @typedef {{mockNextBlockTrackerRequest: (options: Omit<MockBlockTrackerRequestOptions, 'nockScope'>) => void, mockAllBlockTrackerRequests: (options: Omit<MockBlockTrackerRequestOptions, 'nockScope'>) => void, mockRpcCall: (options: Omit<MockRpcCallOptions, 'nockScope'>) => NockScope, rpcUrl: string, infuraNetwork: string}} Communications
 *
 * Provides methods to mock different kinds of requests to the provider.
 */

/**
 * @typedef {{providerType: 'infura' | 'custom', infuraNetwork?: string}} WithMockedCommunicationsOptions
 *
 * The options bag that `Communications` takes.
 */

/**
 * @typedef {(comms: Communications) => Promise<any>} WithMockedCommunicationsCallback
 *
 * The callback that `mockingCommunications` takes.
 */

/**
 * A dummy value for the `infuraProjectId` option that `createInfuraClient`
 * needs. (Infura should not be hit during tests, but just in case, this should
 * not refer to a real project ID.)
 */
const MOCK_INFURA_PROJECT_ID = 'abc123';

/**
 * A dummy value for the `rpcUrl` option that `createJsonRpcClient` needs. (This
 * should not be hit during tests, but just in case, this should also not refer
 * to a real Infura URL.)
 */
const MOCK_RPC_URL = 'http://foo.com';

/**
 * A default value for the `eth_blockNumber` request that the block tracker
 * makes.
 */
const DEFAULT_LATEST_BLOCK_NUMBER = '0x42';

/**
 * If you're having trouble writing a test and you're wondering why the test
 * keeps failing, you can set `process.env.DEBUG_PROVIDER_TESTS` to `1`. This
 * will turn on some extra logging.
 *
 * @param {any[]} args - The arguments that `console.log` takes.
 */
function debug(...args) {
  if (process.env.DEBUG_PROVIDER_TESTS === '1') {
    console.log(...args);
  }
}

/**
 * Builds a Nock scope object for mocking provider requests.
 *
 * @param {string} rpcUrl - The URL of the RPC endpoint.
 * @returns {NockScope} The nock scope.
 */
function buildScopeForMockingRequests(rpcUrl) {
  return nock(rpcUrl).filteringRequestBody((body) => {
    const copyOfBody = JSON.parse(body);
    // Some IDs are random, so remove them entirely from the request to make it
    // possible to mock these requests
    delete copyOfBody.id;
    return JSON.stringify(copyOfBody);
  });
}

/**
 * Mocks the next request for the latest block that the block tracker will make.
 *
 * @param {MockBlockTrackerRequestOptions} args - The arguments.
 * @param {NockScope} args.nockScope - A nock scope (a set of mocked requests
 * scoped to a certain base URL).
 * @param {string} args.blockNumber - The block number that the block tracker
 * should report, as a 0x-prefixed hex string.
 */
async function mockNextBlockTrackerRequest({
  nockScope,
  blockNumber = DEFAULT_LATEST_BLOCK_NUMBER,
}) {
  await mockRpcCall({
    nockScope,
    request: { method: 'eth_blockNumber', params: [] },
    response: { result: blockNumber },
  });
}

/**
 * Mocks all requests for the latest block that the block tracker will make.
 *
 * @param {MockBlockTrackerRequestOptions} args - The arguments.
 * @param {NockScope} args.nockScope - A nock scope (a set of mocked requests
 * scoped to a certain base URL).
 * @param {string} args.blockNumber - The block number that the block tracker
 * should report, as a 0x-prefixed hex string.
 */
async function mockAllBlockTrackerRequests({
  nockScope,
  blockNumber = DEFAULT_LATEST_BLOCK_NUMBER,
}) {
  await mockRpcCall({
    nockScope,
    request: { method: 'eth_blockNumber', params: [] },
    response: { result: blockNumber },
  }).persist();
}

/**
 * Mocks a JSON-RPC request sent to the provider with the given response.
 * Provider type is inferred from the base url set on the nockScope.
 *
 * @param {MockRpcCallOptions} args - The arguments.
 * @param {NockScope} args.nockScope - A nock scope (a set of mocked requests
 * scoped to a certain base URL).
 * @param {object} args.request - The request data.
 * @param {{body: string} | {httpStatus?: number; id?: number; method?: string; params?: string[]}} [args.response] - Information
 * concerning the response that the request should have. If a `body` property is
 * present, this is taken as the complete response body. If an `httpStatus`
 * property is present, then it is taken as the HTTP status code to respond
 * with. Properties other than these two are used to build a complete response
 * body (including `id` and `jsonrpc` properties).
 * @param {Error | string} [args.error] - An error to throw while making the
 * request. Takes precedence over `response`.
 * @param {number} [args.delay] - The amount of time that should pass before the
 * request resolves with the response.
 * @param {number} [args.times] - The number of times that the request is
 * expected to be made.
 * @returns {NockScope} The nock scope.
 */
function mockRpcCall({ nockScope, request, response, error, delay, times }) {
  // eth-query always passes `params`, so even if we don't supply this property,
  // for consistency with makeRpcCall, assume that the `body` contains it
  const { method, params = [], ...rest } = request;
  const httpStatus = response?.httpStatus ?? 200;
  let completeResponse;
  if (response !== undefined) {
    if (response.body === undefined) {
      completeResponse = { id: 1, jsonrpc: '2.0' };
      ['id', 'jsonrpc', 'result', 'error'].forEach((prop) => {
        if (response[prop] !== undefined) {
          completeResponse[prop] = response[prop];
        }
      });
    } else {
      completeResponse = response.body;
    }
  }
  const url = nockScope.basePath.includes('infura.io')
    ? `/v3/${MOCK_INFURA_PROJECT_ID}`
    : '/';
  let nockRequest = nockScope.post(url, {
    jsonrpc: '2.0',
    method,
    params,
    ...rest,
  });

  if (delay !== undefined) {
    nockRequest = nockRequest.delay(delay);
  }

  if (times !== undefined) {
    nockRequest = nockRequest.times(times);
  }

  if (error !== undefined) {
    return nockRequest.replyWithError(error);
  } else if (completeResponse !== undefined) {
    return nockRequest.reply(httpStatus, completeResponse);
  }
  return nockRequest;
}

/**
 * Makes a JSON-RPC call through the given eth-query object.
 *
 * @param {any} ethQuery - The eth-query object.
 * @param {object} request - The request data.
 * @returns {Promise<any>} A promise that either resolves with the result from
 * the JSON-RPC response if it is successful or rejects with the error from the
 * JSON-RPC response otherwise.
 */
function makeRpcCall(ethQuery, request) {
  return new Promise((resolve, reject) => {
    debug('[makeRpcCall] making request', request);
    ethQuery.sendAsync(request, (error, result) => {
      debug('[makeRpcCall > ethQuery handler] error', error, 'result', result);
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * Sets up request mocks for requests to the provider.
 *
 * @param {WithMockedCommunicationsOptions} options - An options bag.
 * @param {"infura" | "custom"} options.providerType - The type of network
 * client being tested.
 * @param {string} [options.infuraNetwork] - The name of the Infura network being
 * tested, assuming that `providerType` is "infura" (default: "mainnet").
 * @param {string} [options.customRpcUrl] - The URL of the custom RPC endpoint,
 * assuming that `providerType` is "custom".
 * @param {WithMockedCommunicationsCallback} fn - A function which will be
 * called with an object that allows interaction with the network client.
 * @returns {Promise<any>} The return value of the given function.
 */
export async function withMockedCommunications(
  { providerType, infuraNetwork = 'mainnet', customRpcUrl = MOCK_RPC_URL },
  fn,
) {
  if (providerType !== 'infura' && providerType !== 'custom') {
    throw new Error(
      `providerType must be either "infura" or "custom", was "${providerType}" instead`,
    );
  }

  const rpcUrl =
    providerType === 'infura'
      ? `https://${infuraNetwork}.infura.io`
      : customRpcUrl;
  const nockScope = buildScopeForMockingRequests(rpcUrl);
  const curriedMockNextBlockTrackerRequest = (localOptions) =>
    mockNextBlockTrackerRequest({ nockScope, ...localOptions });
  const curriedMockAllBlockTrackerRequests = (localOptions) =>
    mockAllBlockTrackerRequests({ nockScope, ...localOptions });
  const curriedMockRpcCall = (localOptions) =>
    mockRpcCall({ nockScope, ...localOptions });
  const comms = {
    mockNextBlockTrackerRequest: curriedMockNextBlockTrackerRequest,
    mockAllBlockTrackerRequests: curriedMockAllBlockTrackerRequests,
    mockRpcCall: curriedMockRpcCall,
    rpcUrl,
    infuraNetwork,
  };

  try {
    return await fn(comms);
  } finally {
    nock.isDone();
    nock.cleanAll();
  }
}

/**
 * Builds a provider from the middleware (for the provider type) along with a
 * block tracker, runs the given function with those two things, and then
 * ensures the block tracker is stopped at the end.
 *
 * @param {WithClientOptions} options - An options bag.
 * @param {"infura" | "custom"} options.providerType - The type of network
 * client being tested.
 * @param {string} [options.infuraNetwork] - The name of the Infura network being
 * tested, assuming that `providerType` is "infura" (default: "mainnet").
 * @param {string} [options.customRpcUrl] - The URL of the custom RPC endpoint,
 * assuming that `providerType` is "custom".
 * @param {string} [options.customChainId] - The chain id belonging to the
 * custom RPC endpoint, assuming that `providerType` is "custom" (default:
 * "0x1").
 * @param {WithClientCallback} fn - A function which will be called with an
 * object that allows interaction with the network client.
 * @returns {Promise<any>} The return value of the given function.
 */
export async function withNetworkClient(
  {
    providerType,
    infuraNetwork = 'mainnet',
    customRpcUrl = MOCK_RPC_URL,
    customChainId = '0x1',
  },
  fn,
) {
  if (providerType !== 'infura' && providerType !== 'custom') {
    throw new Error(
      `providerType must be either "infura" or "custom", was "${providerType}" instead`,
    );
  }

  // The JSON-RPC client wraps `eth_estimateGas` so that it takes 2 seconds longer
  // than it usually would to complete. Or at least it should — this doesn't
  // appear to be working correctly. Unset `IN_TEST` on `process.env` to prevent
  // this behavior.
  const inTest = process.env.IN_TEST;
  delete process.env.IN_TEST;
  const clientUnderTest =
    providerType === 'infura'
      ? createInfuraClient({
          network: infuraNetwork,
          projectId: MOCK_INFURA_PROJECT_ID,
        })
      : createJsonRpcClient({ rpcUrl: customRpcUrl, chainId: customChainId });
  process.env.IN_TEST = inTest;

  const { networkMiddleware, blockTracker } = clientUnderTest;

  const engine = new JsonRpcEngine();
  engine.push(networkMiddleware);
  const provider = providerFromEngine(engine);
  const ethQuery = new EthQuery(provider);

  const curriedMakeRpcCall = (request) => makeRpcCall(ethQuery, request);
  const makeRpcCallsInSeries = async (requests) => {
    const responses = [];
    for (const request of requests) {
      responses.push(await curriedMakeRpcCall(request));
    }
    return responses;
  };
  // Faking timers ends up doing two things:
  // 1. Halting the block tracker (which depends on `setTimeout` to periodically
  // request the latest block) set up in `eth-json-rpc-middleware`
  // 2. Halting the retry logic in `@metamask/eth-json-rpc-infura` (which also
  // depends on `setTimeout`)
  const clock = sinon.useFakeTimers();
  const client = {
    blockTracker,
    clock,
    makeRpcCall: curriedMakeRpcCall,
    makeRpcCallsInSeries,
  };

  try {
    return await fn(client);
  } finally {
    await blockTracker.destroy();

    clock.restore();
  }
}

/**
 * Builds a provider from the middleware (for the provider type) along with a
 * block tracker, runs the given function with those two things, and then
 * ensures the block tracker is stopped at the end.
 *
 * @param {WithClientOptions} options - An options bag.
 * @param {"infura" | "custom"} options.providerType - The type of network
 * client being tested.
 * @param {string} [options.infuraNetwork] - The name of the Infura network being
 * tested, assuming that `providerType` is "infura" (default: "mainnet").
 * @param {string} [options.customRpcUrl] - The URL of the custom RPC endpoint,
 * assuming that `providerType` is "custom".
 * @param {string} [options.customChainId] - The chain id belonging to the
 * custom RPC endpoint, assuming that `providerType` is "custom" (default:
 * "0x1").
 * @returns {Promise<any>} The return provider.
 */
export function getProvider({
  providerType,
  infuraNetwork = 'mainnet',
  customRpcUrl = MOCK_RPC_URL,
  customChainId = '0x1',
  infuraProjectId = MOCK_INFURA_PROJECT_ID,
}) {
  if (providerType !== 'infura' && providerType !== 'custom') {
    throw new Error(
      `providerType must be either "infura" or "custom", was "${providerType}" instead`,
    );
  }

  delete process.env.IN_TEST;
  const clientUnderTest =
    providerType === 'infura'
      ? createInfuraClient({
          network: infuraNetwork,
          projectId: infuraProjectId,
        })
      : createJsonRpcClient({ rpcUrl: customRpcUrl, chainId: customChainId });
  const { networkMiddleware } = clientUnderTest;

  const engine = new JsonRpcEngine();
  engine.push(networkMiddleware);
  return providerFromEngine(engine);
}

export function getEthQueryFromProviderConfig({ chainId }) {
  const rpcUrl = CHAIN_ID_TO_RPC_URL_MAP[chainId];
  if (!rpcUrl) {
    throw new Error('Rpc url not found for this provider');
  }
  const buildedProvider = getProvider({
    providerType: 'custom',
    customRpcUrl: rpcUrl,
    customChainId: chainId,
  });
  return new EthQuery(buildedProvider);
}

/**
 * Build mock parameters for a JSON-RPC call.
 *
 * The string 'some value' is used as the default value for each entry. The
 * block parameter index determines the number of parameters to generate.
 *
 * The block parameter can be set to a custom value. If no value is given, it
 * is set as undefined.
 *
 * @param {object} args - Arguments.
 * @param {number} args.blockParamIndex - The index of the block parameter.
 * @param {any} [args.blockParam] - The block parameter value to set.
 * @returns {any[]} The mock params.
 */
export function buildMockParams({ blockParam, blockParamIndex }) {
  if (blockParamIndex === undefined) {
    throw new Error(`Missing 'blockParamIndex'`);
  }

  const params = new Array(blockParamIndex).fill('some value');
  params[blockParamIndex] = blockParam;

  return params;
}

/**
 * Returns a partial JSON-RPC request object, with the "block" param replaced
 * with the given value.
 *
 * @param {object} request - The request object.
 * @param {string} request.method - The request method.
 * @param {params} [request.params] - The request params.
 * @param {number} blockParamIndex - The index within the `params` array of the
 * block param.
 * @param {any} blockParam - The desired block param value.
 * @returns {object} The updated request object.
 */
export function buildRequestWithReplacedBlockParam(
  { method, params = [] },
  blockParamIndex,
  blockParam,
) {
  const updatedParams = params.slice();
  updatedParams[blockParamIndex] = blockParam;
  return { method, params: updatedParams };
}
