import { ApprovalController } from '@metamask/approval-controller';
import { ControllerMessenger } from '@metamask/base-controller';
import {
  ApprovalType,
  BUILT_IN_NETWORKS,
  InfuraNetworkType,
  NetworkType,
} from '@metamask/controller-utils';
import {
  NetworkController,
  NetworkClientType,
} from '@metamask/network-controller';
import type { NetworkClientConfiguration } from '@metamask/network-controller';
import nock from 'nock';
import type { SinonFakeTimers } from 'sinon';
import { useFakeTimers } from 'sinon';

import { advanceTime } from '../../../tests/helpers';
import { mockNetwork } from '../../../tests/mock-network';
import {
  ETHERSCAN_TRANSACTION_BASE_MOCK,
  ETHERSCAN_TRANSACTION_RESPONSE_MOCK,
  ETHERSCAN_TOKEN_TRANSACTION_MOCK,
  ETHERSCAN_TRANSACTION_SUCCESS_MOCK,
} from '../test/EtherscanMocks';
import {
  buildEthGasPriceRequestMock,
  buildEthBlockNumberRequestMock,
  buildEthGetCodeRequestMock,
  buildEthGetBlockByNumberRequestMock,
  buildEthEstimateGasRequestMock,
  buildEthGetTransactionCountRequestMock,
  buildEthGetBlockByHashRequestMock,
  buildEthSendRawTransactionRequestMock,
  buildEthGetTransactionReceiptRequestMock,
} from '../test/JsonRpcRequestMocks';
import { TransactionController } from './TransactionController';
import type { TransactionMeta } from './types';
import { TransactionStatus, TransactionType } from './types';
import { getEtherscanApiHost } from './utils/etherscan';
import * as etherscanUtils from './utils/etherscan';

const ACCOUNT_MOCK = '0x6bf137f335ea1b8f193b8f6ea92561a60d23a207';
const ACCOUNT_2_MOCK = '0x08f137f335ea1b8f193b8f6ea92561a60d23a211';
const ACCOUNT_3_MOCK = '0xe688b84b23f322a994a53dbf8e15fa82cdb71127';
const infuraProjectId = 'fake-infura-project-id';

const BLOCK_TRACKER_POLLING_INTERVAL = 20000;

/**
 * Builds the Infura network client configuration.
 * @param network - The Infura network type.
 * @returns The network client configuration.
 */
function buildInfuraNetworkClientConfiguration(
  network: InfuraNetworkType,
): NetworkClientConfiguration {
  return {
    type: NetworkClientType.Infura,
    network,
    chainId: BUILT_IN_NETWORKS[network].chainId,
    infuraProjectId,
    ticker: BUILT_IN_NETWORKS[network].ticker,
  };
}

const customGoerliNetworkClientConfiguration = {
  type: NetworkClientType.Custom,
  chainId: BUILT_IN_NETWORKS[NetworkType.goerli].chainId,
  ticker: BUILT_IN_NETWORKS[NetworkType.goerli].ticker,
  rpcUrl: 'https://mock.rpc.url',
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const newController = async (options: any = {}) => {
  // Mainnet network must be mocked for NetworkController instantiation
  mockNetwork({
    networkClientConfiguration: buildInfuraNetworkClientConfiguration(
      InfuraNetworkType.mainnet,
    ),
    mocks: [
      {
        ...buildEthBlockNumberRequestMock('0x1'),
        discardAfterMatching: false,
      },
    ],
  });

  const messenger = new ControllerMessenger();
  const networkController = new NetworkController({
    messenger: messenger.getRestricted({ name: 'NetworkController' }),
    trackMetaMetricsEvent: () => {
      // noop
    },
    infuraProjectId,
  });
  await networkController.initializeProvider();
  const { provider, blockTracker } =
    networkController.getProviderAndBlockTracker();

  const approvalController = new ApprovalController({
    messenger: messenger.getRestricted({
      name: 'ApprovalController',
    }),
    showApprovalRequest: jest.fn(),
    typesExcludedFromRateLimiting: [ApprovalType.Transaction],
  });

  const { state, config, ...opts } = options;

  const transactionController = new TransactionController(
    {
      provider,
      blockTracker,
      messenger,
      onNetworkStateChange: () => {
        // noop
      },
      getCurrentNetworkEIP1559Compatibility:
        networkController.getEIP1559Compatibility.bind(networkController),
      getNetworkClientRegistry:
        opts.getNetworkClientRegistrySpy ||
        networkController.getNetworkClientRegistry.bind(networkController),
      findNetworkClientIdByChainId:
        networkController.findNetworkClientIdByChainId.bind(networkController),
      getNetworkClientById:
        networkController.getNetworkClientById.bind(networkController),
      getNetworkState: () => networkController.state,
      getSelectedAddress: () => '0xdeadbeef',
      getPermittedAccounts: () => [ACCOUNT_MOCK],
      isMultichainEnabled: true,
      ...opts,
    },
    {
      sign: (transaction) => Promise.resolve(transaction),
      ...config,
    },
    state,
  );

  return {
    transactionController,
    approvalController,
    networkController,
  };
};

describe('TransactionController Integration', () => {
  let clock: SinonFakeTimers;
  beforeEach(() => {
    clock = useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  describe('constructor', () => {
    it('should create a new instance of TransactionController', async () => {
      const { transactionController } = await newController({});
      expect(transactionController).toBeDefined();
      transactionController.destroy();
    });

    it('should submit all approved transactions in state', async () => {
      mockNetwork({
        networkClientConfiguration: buildInfuraNetworkClientConfiguration(
          InfuraNetworkType.goerli,
        ),
        mocks: [
          buildEthBlockNumberRequestMock('0x1'),
          buildEthSendRawTransactionRequestMock(
            '0x02e2050101018252089408f137f335ea1b8f193b8f6ea92561a60d23a2118080c0808080',
            '0x1',
          ),
        ],
      });

      mockNetwork({
        networkClientConfiguration: buildInfuraNetworkClientConfiguration(
          InfuraNetworkType.sepolia,
        ),
        mocks: [
          buildEthBlockNumberRequestMock('0x1'),
          buildEthSendRawTransactionRequestMock(
            '0x02e583aa36a70101018252089408f137f335ea1b8f193b8f6ea92561a60d23a2118080c0808080',
            '0x1',
          ),
        ],
      });

      const { transactionController } = await newController({
        state: {
          transactions: [
            {
              actionId: undefined,
              chainId: '0x5',
              dappSuggestedGasFees: undefined,
              deviceConfirmedOn: undefined,
              id: 'ecfe8c60-ba27-11ee-8643-dfd28279a442',
              origin: undefined,
              securityAlertResponse: undefined,
              status: 'approved',
              time: 1706039113766,
              txParams: {
                from: '0x6bf137f335ea1b8f193b8f6ea92561a60d23a207',
                gas: '0x5208',
                nonce: '0x1',
                to: '0x08f137f335ea1b8f193b8f6ea92561a60d23a211',
                value: '0x0',
                maxFeePerGas: '0x1',
                maxPriorityFeePerGas: '0x1',
              },
              userEditedGasLimit: false,
              verifiedOnBlockchain: false,
              type: 'simpleSend',
              networkClientId: 'goerli',
              simulationFails: undefined,
              originalGasEstimate: '0x5208',
              defaultGasEstimates: {
                gas: '0x5208',
                maxFeePerGas: '0x1',
                maxPriorityFeePerGas: '0x1',
                gasPrice: undefined,
                estimateType: 'dappSuggested',
              },
              userFeeLevel: 'dappSuggested',
              sendFlowHistory: [],
              history: [{}, []],
            },
            {
              actionId: undefined,
              chainId: '0xaa36a7',
              dappSuggestedGasFees: undefined,
              deviceConfirmedOn: undefined,
              id: 'c4cc0ff0-ba28-11ee-926f-55a7f9c2c2c6',
              origin: undefined,
              securityAlertResponse: undefined,
              status: 'approved',
              time: 1706039113766,
              txParams: {
                from: '0x6bf137f335ea1b8f193b8f6ea92561a60d23a207',
                gas: '0x5208',
                nonce: '0x1',
                to: '0x08f137f335ea1b8f193b8f6ea92561a60d23a211',
                value: '0x0',
                maxFeePerGas: '0x1',
                maxPriorityFeePerGas: '0x1',
              },
              userEditedGasLimit: false,
              verifiedOnBlockchain: false,
              type: 'simpleSend',
              networkClientId: 'sepolia',
              simulationFails: undefined,
              originalGasEstimate: '0x5208',
              defaultGasEstimates: {
                gas: '0x5208',
                maxFeePerGas: '0x1',
                maxPriorityFeePerGas: '0x1',
                gasPrice: undefined,
                estimateType: 'dappSuggested',
              },
              userFeeLevel: 'dappSuggested',
              sendFlowHistory: [],
              history: [{}, []],
            },
          ],
        },
      });
      await advanceTime({ clock, duration: 1 });

      expect(transactionController.state.transactions).toHaveLength(2);
      expect(transactionController.state.transactions[0].status).toBe(
        'submitted',
      );
      expect(transactionController.state.transactions[1].status).toBe(
        'submitted',
      );
      transactionController.destroy();
    });
  });
  describe('multichain transaction lifecycle', () => {
    describe('when a transaction is added with a networkClientId that does not match the globally selected network', () => {
      it('should add a new unapproved transaction', async () => {
        mockNetwork({
          networkClientConfiguration: buildInfuraNetworkClientConfiguration(
            InfuraNetworkType.goerli,
          ),
          mocks: [
            buildEthBlockNumberRequestMock('0x1'),
            buildEthGetCodeRequestMock(ACCOUNT_2_MOCK),
            buildEthGasPriceRequestMock(),
          ],
        });
        const { transactionController } = await newController({});
        await transactionController.addTransaction(
          {
            from: ACCOUNT_MOCK,
            to: ACCOUNT_2_MOCK,
          },
          { networkClientId: 'goerli' },
        );
        expect(transactionController.state.transactions).toHaveLength(1);
        expect(transactionController.state.transactions[0].status).toBe(
          'unapproved',
        );
        transactionController.destroy();
      });
      it('should be able to get to submitted state', async () => {
        mockNetwork({
          networkClientConfiguration: buildInfuraNetworkClientConfiguration(
            InfuraNetworkType.goerli,
          ),
          mocks: [
            buildEthBlockNumberRequestMock('0x1'),
            buildEthGetBlockByNumberRequestMock('0x1'),
            buildEthBlockNumberRequestMock('0x2'),
            buildEthGetCodeRequestMock(ACCOUNT_2_MOCK),
            buildEthEstimateGasRequestMock(ACCOUNT_MOCK, ACCOUNT_2_MOCK),
            buildEthGasPriceRequestMock(),
            buildEthGetTransactionCountRequestMock(ACCOUNT_MOCK),
            buildEthSendRawTransactionRequestMock(
              '0x02e2050101018252089408f137f335ea1b8f193b8f6ea92561a60d23a2118080c0808080',
              '0x1',
            ),
          ],
        });
        const { transactionController, approvalController } =
          await newController({});
        const { result, transactionMeta } =
          await transactionController.addTransaction(
            {
              from: ACCOUNT_MOCK,
              to: ACCOUNT_2_MOCK,
            },
            { networkClientId: 'goerli' },
          );

        await approvalController.accept(transactionMeta.id);
        await advanceTime({ clock, duration: 1 });

        await result;

        expect(transactionController.state.transactions).toHaveLength(1);
        expect(transactionController.state.transactions[0].status).toBe(
          'submitted',
        );
        transactionController.destroy();
      });
      it('should be able to get to confirmed state', async () => {
        mockNetwork({
          networkClientConfiguration: buildInfuraNetworkClientConfiguration(
            InfuraNetworkType.goerli,
          ),
          mocks: [
            buildEthBlockNumberRequestMock('0x1'),
            buildEthGetBlockByNumberRequestMock('0x1'),
            buildEthGetCodeRequestMock(ACCOUNT_2_MOCK),
            buildEthEstimateGasRequestMock(ACCOUNT_MOCK, ACCOUNT_2_MOCK),
            buildEthGasPriceRequestMock(),
            buildEthGetTransactionCountRequestMock(ACCOUNT_MOCK),
            buildEthSendRawTransactionRequestMock(
              '0x02e2050101018252089408f137f335ea1b8f193b8f6ea92561a60d23a2118080c0808080',
              '0x1',
            ),
            buildEthBlockNumberRequestMock('0x3'),
            buildEthGetTransactionReceiptRequestMock('0x1', '0x1', '0x3'),
            buildEthGetBlockByHashRequestMock('0x1'),
          ],
        });
        const { transactionController, approvalController } =
          await newController({});
        const { result, transactionMeta } =
          await transactionController.addTransaction(
            {
              from: ACCOUNT_MOCK,
              to: ACCOUNT_2_MOCK,
            },
            { networkClientId: 'goerli' },
          );

        await approvalController.accept(transactionMeta.id);
        await advanceTime({ clock, duration: 1 });

        await result;
        // blocktracker polling is 20s
        await advanceTime({ clock, duration: BLOCK_TRACKER_POLLING_INTERVAL });
        await advanceTime({ clock, duration: 1 });
        await advanceTime({ clock, duration: 1 });

        expect(transactionController.state.transactions).toHaveLength(1);
        expect(transactionController.state.transactions[0].status).toBe(
          'confirmed',
        );
        transactionController.destroy();
      });
      it('should be able to send and confirm transactions on different chains', async () => {
        mockNetwork({
          networkClientConfiguration: buildInfuraNetworkClientConfiguration(
            InfuraNetworkType.goerli,
          ),
          mocks: [
            buildEthBlockNumberRequestMock('0x1'),
            buildEthGetBlockByNumberRequestMock('0x1'),
            buildEthGetCodeRequestMock(ACCOUNT_2_MOCK),
            buildEthEstimateGasRequestMock(ACCOUNT_MOCK, ACCOUNT_2_MOCK),
            buildEthGasPriceRequestMock(),
            buildEthGetTransactionCountRequestMock(ACCOUNT_MOCK),
            buildEthSendRawTransactionRequestMock(
              '0x02e2050101018252089408f137f335ea1b8f193b8f6ea92561a60d23a2118080c0808080',
              '0x1',
            ),
            buildEthBlockNumberRequestMock('0x3'),
            buildEthGetTransactionReceiptRequestMock('0x1', '0x1', '0x3'),
            buildEthGetBlockByHashRequestMock('0x1'),
          ],
        });
        mockNetwork({
          networkClientConfiguration: buildInfuraNetworkClientConfiguration(
            InfuraNetworkType.sepolia,
          ),
          mocks: [
            buildEthBlockNumberRequestMock('0x1'),
            buildEthGetBlockByNumberRequestMock('0x1'),
            buildEthGetCodeRequestMock(ACCOUNT_2_MOCK),
            buildEthEstimateGasRequestMock(ACCOUNT_MOCK, ACCOUNT_2_MOCK),
            buildEthGasPriceRequestMock(),
            buildEthGetTransactionCountRequestMock(ACCOUNT_MOCK),
            buildEthSendRawTransactionRequestMock(
              '0x02e583aa36a70101018252089408f137f335ea1b8f193b8f6ea92561a60d23a2118080c0808080',
              '0x1',
            ),
            buildEthBlockNumberRequestMock('0x3'),
            buildEthGetTransactionReceiptRequestMock('0x1', '0x1', '0x3'),
            buildEthGetBlockByHashRequestMock('0x1'),
          ],
        });
        const { transactionController, approvalController } =
          await newController({});
        const firstTransaction = await transactionController.addTransaction(
          {
            from: ACCOUNT_MOCK,
            to: ACCOUNT_2_MOCK,
          },
          { networkClientId: 'goerli' },
        );
        const secondTransaction = await transactionController.addTransaction(
          {
            from: ACCOUNT_MOCK,
            to: ACCOUNT_2_MOCK,
          },
          { networkClientId: 'sepolia', origin: 'test' },
        );

        await Promise.all([
          approvalController.accept(firstTransaction.transactionMeta.id),
          approvalController.accept(secondTransaction.transactionMeta.id),
        ]);
        await advanceTime({ clock, duration: 1 });
        await advanceTime({ clock, duration: 1 });

        await Promise.all([firstTransaction.result, secondTransaction.result]);

        // blocktracker polling is 20s
        await advanceTime({ clock, duration: BLOCK_TRACKER_POLLING_INTERVAL });
        await advanceTime({ clock, duration: 1 });
        await advanceTime({ clock, duration: 1 });

        expect(transactionController.state.transactions).toHaveLength(2);
        expect(transactionController.state.transactions[0].status).toBe(
          'confirmed',
        );
        expect(
          transactionController.state.transactions[0].networkClientId,
        ).toBe('sepolia');
        expect(transactionController.state.transactions[1].status).toBe(
          'confirmed',
        );
        expect(
          transactionController.state.transactions[1].networkClientId,
        ).toBe('goerli');
        transactionController.destroy();
      });
      it('should be able to cancel a transaction', async () => {
        mockNetwork({
          networkClientConfiguration: buildInfuraNetworkClientConfiguration(
            InfuraNetworkType.goerli,
          ),
          mocks: [
            buildEthBlockNumberRequestMock('0x1'),
            buildEthGetBlockByNumberRequestMock('0x1'),
            buildEthGetCodeRequestMock(ACCOUNT_2_MOCK),
            buildEthEstimateGasRequestMock(ACCOUNT_MOCK, ACCOUNT_2_MOCK),
            buildEthGasPriceRequestMock(),
            buildEthGetTransactionCountRequestMock(ACCOUNT_MOCK),
            buildEthSendRawTransactionRequestMock(
              '0x02e2050101018252089408f137f335ea1b8f193b8f6ea92561a60d23a2118080c0808080',
              '0x1',
            ),
            buildEthBlockNumberRequestMock('0x3'),
            buildEthGetTransactionReceiptRequestMock('0x1', '0x1', '0x3'),
            buildEthGetBlockByHashRequestMock('0x1'),
            buildEthBlockNumberRequestMock('0x3'),
            buildEthSendRawTransactionRequestMock(
              '0x02e205010101825208946bf137f335ea1b8f193b8f6ea92561a60d23a2078080c0808080',
              '0x2',
            ),
            buildEthGetTransactionReceiptRequestMock('0x2', '0x1', '0x3'),
          ],
        });
        const { transactionController, approvalController } =
          await newController({});
        const { result, transactionMeta } =
          await transactionController.addTransaction(
            {
              from: ACCOUNT_MOCK,
              to: ACCOUNT_2_MOCK,
            },
            { networkClientId: 'goerli' },
          );

        await approvalController.accept(transactionMeta.id);
        await advanceTime({ clock, duration: 1 });

        await result;

        await transactionController.stopTransaction(transactionMeta.id);

        expect(transactionController.state.transactions).toHaveLength(2);
        expect(transactionController.state.transactions[1].status).toBe(
          'submitted',
        );
        transactionController.destroy();
      });
      it('should be able to confirm a cancelled transaction and drop the original transaction', async () => {
        mockNetwork({
          networkClientConfiguration: buildInfuraNetworkClientConfiguration(
            InfuraNetworkType.goerli,
          ),
          mocks: [
            buildEthBlockNumberRequestMock('0x1'),
            buildEthGetBlockByNumberRequestMock('0x1'),
            buildEthGetCodeRequestMock(ACCOUNT_2_MOCK),
            buildEthEstimateGasRequestMock(ACCOUNT_MOCK, ACCOUNT_2_MOCK),
            buildEthGasPriceRequestMock(),
            buildEthGetTransactionCountRequestMock(ACCOUNT_MOCK),
            buildEthSendRawTransactionRequestMock(
              '0x02e2050101018252089408f137f335ea1b8f193b8f6ea92561a60d23a2118080c0808080',
              '0x1',
            ),
            buildEthBlockNumberRequestMock('0x3'),
            buildEthSendRawTransactionRequestMock(
              '0x02e205010101825208946bf137f335ea1b8f193b8f6ea92561a60d23a2078080c0808080',
              '0x2',
            ),
            {
              ...buildEthGetTransactionReceiptRequestMock('0x1', '0x0', '0x0'),
              response: { result: null },
            },
            buildEthBlockNumberRequestMock('0x4'),
            buildEthBlockNumberRequestMock('0x4'),
            {
              ...buildEthGetTransactionReceiptRequestMock('0x1', '0x0', '0x0'),
              response: { result: null },
            },
            buildEthGetTransactionReceiptRequestMock('0x2', '0x2', '0x4'),
            buildEthGetBlockByHashRequestMock('0x2'),
          ],
        });
        const { transactionController, approvalController } =
          await newController({});
        const { result, transactionMeta } =
          await transactionController.addTransaction(
            {
              from: ACCOUNT_MOCK,
              to: ACCOUNT_2_MOCK,
            },
            { networkClientId: 'goerli' },
          );

        await approvalController.accept(transactionMeta.id);
        await advanceTime({ clock, duration: 1 });

        await result;

        await transactionController.stopTransaction(transactionMeta.id);

        // blocktracker polling is 20s
        await advanceTime({ clock, duration: BLOCK_TRACKER_POLLING_INTERVAL });
        await advanceTime({ clock, duration: 1 });
        await advanceTime({ clock, duration: 1 });
        await advanceTime({ clock, duration: BLOCK_TRACKER_POLLING_INTERVAL });
        await advanceTime({ clock, duration: 1 });
        await advanceTime({ clock, duration: 1 });

        expect(transactionController.state.transactions).toHaveLength(2);
        expect(transactionController.state.transactions[0].status).toBe(
          'dropped',
        );
        expect(transactionController.state.transactions[1].status).toBe(
          'confirmed',
        );
        transactionController.destroy();
      });
      it('should be able to get to speedup state and drop the original transaction', async () => {
        mockNetwork({
          networkClientConfiguration: buildInfuraNetworkClientConfiguration(
            InfuraNetworkType.goerli,
          ),
          mocks: [
            buildEthBlockNumberRequestMock('0x1'),
            buildEthGetBlockByNumberRequestMock('0x1'),
            buildEthGetCodeRequestMock(ACCOUNT_2_MOCK),
            buildEthEstimateGasRequestMock(ACCOUNT_MOCK, ACCOUNT_2_MOCK),
            buildEthGasPriceRequestMock(),
            buildEthGetTransactionCountRequestMock(ACCOUNT_MOCK),
            buildEthSendRawTransactionRequestMock(
              '0x02e605018203e88203e88252089408f137f335ea1b8f193b8f6ea92561a60d23a2118080c0808080',
              '0x1',
            ),
            buildEthBlockNumberRequestMock('0x3'),
            {
              ...buildEthGetTransactionReceiptRequestMock('0x1', '0x0', '0x0'),
              response: { result: null },
            },
            buildEthSendRawTransactionRequestMock(
              '0x02e6050182044c82044c8252089408f137f335ea1b8f193b8f6ea92561a60d23a2118080c0808080',
              '0x2',
            ),
            buildEthBlockNumberRequestMock('0x4'),
            buildEthBlockNumberRequestMock('0x4'),
            {
              ...buildEthGetTransactionReceiptRequestMock('0x1', '0x0', '0x0'),
              response: { result: null },
            },
            buildEthGetTransactionReceiptRequestMock('0x2', '0x2', '0x4'),
            buildEthGetBlockByHashRequestMock('0x2'),
          ],
        });
        const { transactionController, approvalController } =
          await newController({});
        const { result, transactionMeta } =
          await transactionController.addTransaction(
            {
              from: ACCOUNT_MOCK,
              to: ACCOUNT_2_MOCK,
              maxFeePerGas: '0x3e8',
            },
            { networkClientId: 'goerli' },
          );

        await approvalController.accept(transactionMeta.id);
        await advanceTime({ clock, duration: 1 });

        await result;

        await transactionController.speedUpTransaction(transactionMeta.id);

        // blocktracker polling is 20s
        await advanceTime({ clock, duration: BLOCK_TRACKER_POLLING_INTERVAL });
        await advanceTime({ clock, duration: 1 });
        await advanceTime({ clock, duration: 1 });
        await advanceTime({ clock, duration: BLOCK_TRACKER_POLLING_INTERVAL });
        await advanceTime({ clock, duration: 1 });
        await advanceTime({ clock, duration: 1 });

        expect(transactionController.state.transactions).toHaveLength(2);
        expect(transactionController.state.transactions[0].status).toBe(
          'dropped',
        );
        expect(transactionController.state.transactions[1].status).toBe(
          'confirmed',
        );
        const baseFee =
          transactionController.state.transactions[0].txParams.maxFeePerGas;
        expect(
          Number(
            transactionController.state.transactions[1].txParams.maxFeePerGas,
          ),
        ).toBeGreaterThan(Number(baseFee));
        transactionController.destroy();
      });
    });

    describe('when transactions are added concurrently with different networkClientIds but on the same chainId', () => {
      it('should add each transaction with consecutive nonces', async () => {
        mockNetwork({
          networkClientConfiguration: buildInfuraNetworkClientConfiguration(
            InfuraNetworkType.goerli,
          ),
          mocks: [
            buildEthBlockNumberRequestMock('0x1'),
            buildEthGetBlockByNumberRequestMock('0x1'),
            buildEthGetCodeRequestMock(ACCOUNT_2_MOCK),
            buildEthEstimateGasRequestMock(ACCOUNT_MOCK, ACCOUNT_2_MOCK),
            buildEthGasPriceRequestMock(),
            buildEthGetTransactionCountRequestMock(ACCOUNT_MOCK),
            buildEthSendRawTransactionRequestMock(
              '0x02e2050101018252089408f137f335ea1b8f193b8f6ea92561a60d23a2118080c0808080',
              '0x1',
            ),
            buildEthBlockNumberRequestMock('0x3'),
            buildEthGetTransactionReceiptRequestMock('0x1', '0x1', '0x3'),
            buildEthGetBlockByHashRequestMock('0x1'),
            buildEthBlockNumberRequestMock('0x3'),
          ],
        });

        mockNetwork({
          networkClientConfiguration: customGoerliNetworkClientConfiguration,
          mocks: [
            buildEthBlockNumberRequestMock('0x1'),
            buildEthBlockNumberRequestMock('0x1'),
            buildEthGetBlockByNumberRequestMock('0x1'),
            buildEthGetCodeRequestMock(ACCOUNT_2_MOCK),
            buildEthEstimateGasRequestMock(ACCOUNT_MOCK, ACCOUNT_2_MOCK),
            buildEthGasPriceRequestMock(),
            buildEthGetTransactionCountRequestMock(ACCOUNT_MOCK),
            buildEthSendRawTransactionRequestMock(
              '0x02e0050201018094e688b84b23f322a994a53dbf8e15fa82cdb711278080c0808080',
              '0x1',
            ),
            buildEthBlockNumberRequestMock('0x3'),
            buildEthGetTransactionReceiptRequestMock('0x1', '0x1', '0x3'),
            buildEthGetBlockByHashRequestMock('0x1'),
          ],
        });

        const { approvalController, networkController, transactionController } =
          await newController({
            getPermittedAccounts: () => [ACCOUNT_MOCK],
            getSelectedAddress: () => ACCOUNT_MOCK,
          });
        const otherNetworkClientIdOnGoerli =
          await networkController.upsertNetworkConfiguration(
            {
              rpcUrl: 'https://mock.rpc.url',
              chainId: BUILT_IN_NETWORKS[NetworkType.goerli].chainId,
              ticker: BUILT_IN_NETWORKS[NetworkType.goerli].ticker,
            },
            {
              referrer: 'https://mock.referrer',
              source: 'dapp',
            },
          );

        const addTx1 = await transactionController.addTransaction(
          {
            from: ACCOUNT_MOCK,
            to: ACCOUNT_2_MOCK,
          },
          { networkClientId: 'goerli' },
        );

        const addTx2 = await transactionController.addTransaction(
          {
            from: ACCOUNT_MOCK,
            to: ACCOUNT_3_MOCK,
          },
          {
            networkClientId: otherNetworkClientIdOnGoerli,
          },
        );

        await Promise.all([
          approvalController.accept(addTx1.transactionMeta.id),
          approvalController.accept(addTx2.transactionMeta.id),
        ]);
        await advanceTime({ clock, duration: 1 });

        await Promise.all([addTx1.result, addTx2.result]);

        const nonces = transactionController.state.transactions
          .map((tx) => tx.txParams.nonce)
          .sort();
        expect(nonces).toStrictEqual(['0x1', '0x2']);
        transactionController.destroy();
      });
    });

    describe('when transactions are added concurrently with the same networkClientId', () => {
      it('should add each transaction with consecutive nonces', async () => {
        mockNetwork({
          networkClientConfiguration: buildInfuraNetworkClientConfiguration(
            InfuraNetworkType.goerli,
          ),
          mocks: [
            buildEthBlockNumberRequestMock('0x1'),
            buildEthGetBlockByNumberRequestMock('0x1'),
            buildEthGetCodeRequestMock(ACCOUNT_2_MOCK),
            buildEthGetCodeRequestMock(ACCOUNT_3_MOCK),
            buildEthEstimateGasRequestMock(ACCOUNT_MOCK, ACCOUNT_2_MOCK),
            buildEthGasPriceRequestMock(),
            buildEthGetTransactionCountRequestMock(ACCOUNT_MOCK),
            buildEthSendRawTransactionRequestMock(
              '0x02e2050101018252089408f137f335ea1b8f193b8f6ea92561a60d23a2118080c0808080',
              '0x1',
            ),
            buildEthBlockNumberRequestMock('0x3'),
            buildEthGetTransactionReceiptRequestMock('0x1', '0x1', '0x3'),
            buildEthGetBlockByHashRequestMock('0x1'),
            buildEthSendRawTransactionRequestMock(
              '0x02e20502010182520894e688b84b23f322a994a53dbf8e15fa82cdb711278080c0808080',
              '0x2',
            ),
            buildEthGetTransactionReceiptRequestMock('0x2', '0x2', '0x4'),
          ],
        });
        const { approvalController, transactionController } =
          await newController({
            getPermittedAccounts: () => [ACCOUNT_MOCK],
            getSelectedAddress: () => ACCOUNT_MOCK,
          });

        const addTx1 = await transactionController.addTransaction(
          {
            from: ACCOUNT_MOCK,
            to: ACCOUNT_2_MOCK,
          },
          { networkClientId: 'goerli' },
        );

        await advanceTime({ clock, duration: 1 });

        const addTx2 = await transactionController.addTransaction(
          {
            from: ACCOUNT_MOCK,
            to: ACCOUNT_3_MOCK,
          },
          {
            networkClientId: 'goerli',
          },
        );

        await advanceTime({ clock, duration: 1 });

        await Promise.all([
          approvalController.accept(addTx1.transactionMeta.id),
          approvalController.accept(addTx2.transactionMeta.id),
        ]);

        await advanceTime({ clock, duration: 1 });

        await Promise.all([addTx1.result, addTx2.result]);

        const nonces = transactionController.state.transactions
          .map((tx) => tx.txParams.nonce)
          .sort();
        expect(nonces).toStrictEqual(['0x1', '0x2']);
        transactionController.destroy();
      });
    });
  });

  describe('when changing rpcUrl of networkClient', () => {
    it('should start tracking when a new network is added', async () => {
      mockNetwork({
        networkClientConfiguration: customGoerliNetworkClientConfiguration,
        mocks: [
          buildEthBlockNumberRequestMock('0x1'),
          buildEthBlockNumberRequestMock('0x1'),
          buildEthGetBlockByNumberRequestMock('0x1'),
          buildEthGetCodeRequestMock(ACCOUNT_2_MOCK),
          buildEthGasPriceRequestMock(),
        ],
      });
      const { networkController, transactionController } =
        await newController();

      const otherNetworkClientIdOnGoerli =
        await networkController.upsertNetworkConfiguration(
          customGoerliNetworkClientConfiguration,
          {
            setActive: false,
            referrer: 'https://mock.referrer',
            source: 'dapp',
          },
        );

      await transactionController.addTransaction(
        {
          from: ACCOUNT_MOCK,
          to: ACCOUNT_3_MOCK,
        },
        {
          networkClientId: otherNetworkClientIdOnGoerli,
        },
      );

      expect(transactionController.state.transactions[0]).toStrictEqual(
        expect.objectContaining({
          networkClientId: otherNetworkClientIdOnGoerli,
        }),
      );
      transactionController.destroy();
    });
    it('should stop tracking when a network is removed', async () => {
      const { networkController, transactionController } =
        await newController();

      const configurationId =
        await networkController.upsertNetworkConfiguration(
          customGoerliNetworkClientConfiguration,
          {
            setActive: false,
            referrer: 'https://mock.referrer',
            source: 'dapp',
          },
        );

      networkController.removeNetworkConfiguration(configurationId);

      await expect(
        transactionController.addTransaction(
          {
            from: ACCOUNT_MOCK,
            to: ACCOUNT_2_MOCK,
          },
          { networkClientId: configurationId },
        ),
      ).rejects.toThrow(
        'The networkClientId for this transaction could not be found',
      );

      expect(transactionController).toBeDefined();
      transactionController.destroy();
    });
  });

  describe('feature flag', () => {
    it('should not allow transaction to be added with a networkClientId when feature flag is disabled', async () => {
      mockNetwork({
        networkClientConfiguration: buildInfuraNetworkClientConfiguration(
          InfuraNetworkType.mainnet,
        ),
        mocks: [
          buildEthBlockNumberRequestMock('0x1'),
          buildEthBlockNumberRequestMock('0x2'),
          buildEthGetBlockByNumberRequestMock('0x1'),
          buildEthGasPriceRequestMock(),
          buildEthGetCodeRequestMock(ACCOUNT_2_MOCK),
        ],
      });

      const { networkController, transactionController } = await newController({
        isMultichainEnabled: false,
      });

      const configurationId =
        await networkController.upsertNetworkConfiguration(
          customGoerliNetworkClientConfiguration,
          {
            setActive: false,
            referrer: 'https://mock.referrer',
            source: 'dapp',
          },
        );

      // add a transaction with the networkClientId of the newly added network
      // and expect it to throw since the networkClientId won't be found in the trackingMap
      await expect(
        transactionController.addTransaction(
          {
            from: ACCOUNT_MOCK,
            to: ACCOUNT_2_MOCK,
          },
          { networkClientId: configurationId },
        ),
      ).rejects.toThrow(
        'The networkClientId for this transaction could not be found',
      );

      // adding a transaction without a networkClientId should work
      expect(
        await transactionController.addTransaction({
          from: ACCOUNT_MOCK,
          to: ACCOUNT_2_MOCK,
        }),
      ).toBeDefined();
      transactionController.destroy();
    });
    it('should not call getNetworkClientRegistry on networkController:stateChange when feature flag is disabled', async () => {
      const getNetworkClientRegistrySpy = jest.fn().mockImplementation(() => {
        return {
          [NetworkType.goerli]: {
            configuration: customGoerliNetworkClientConfiguration,
          },
        };
      });

      const { networkController, transactionController } = await newController({
        isMultichainEnabled: false,
        getNetworkClientRegistrySpy,
      });

      await networkController.upsertNetworkConfiguration(
        customGoerliNetworkClientConfiguration,
        {
          setActive: false,
          referrer: 'https://mock.referrer',
          source: 'dapp',
        },
      );

      expect(getNetworkClientRegistrySpy).not.toHaveBeenCalled();
      transactionController.destroy();
    });
    it('should call getNetworkClientRegistry on networkController:stateChange when feature flag is enabled', async () => {
      const getNetworkClientRegistrySpy = jest.fn().mockImplementation(() => {
        return {
          [NetworkType.goerli]: {
            configuration: BUILT_IN_NETWORKS[NetworkType.goerli],
          },
        };
      });

      const { networkController, transactionController } = await newController({
        isMultichainEnabled: true,
        getNetworkClientRegistrySpy,
      });

      await networkController.upsertNetworkConfiguration(
        customGoerliNetworkClientConfiguration,
        {
          setActive: false,
          referrer: 'https://mock.referrer',
          source: 'dapp',
        },
      );

      expect(getNetworkClientRegistrySpy).toHaveBeenCalled();
      transactionController.destroy();
    });
    it('should call getNetworkClientRegistry on construction when feature flag is enabled', async () => {
      const getNetworkClientRegistrySpy = jest.fn().mockImplementation(() => {
        return {
          [NetworkType.goerli]: {
            configuration: BUILT_IN_NETWORKS[NetworkType.goerli],
          },
        };
      });

      await newController({
        isMultichainEnabled: true,
        getNetworkClientRegistrySpy,
      });

      expect(getNetworkClientRegistrySpy).toHaveBeenCalled();
    });
  });

  describe('startIncomingTransactionPolling', () => {
    // TODO(JL): IncomingTransactionHelper doesn't populate networkClientId on the generated tx object. Should it?..
    it('should add incoming transactions to state with the correct chainId for the given networkClientId on the next block', async () => {
      mockNetwork({
        networkClientConfiguration: buildInfuraNetworkClientConfiguration(
          InfuraNetworkType.mainnet,
        ),
        mocks: [
          buildEthBlockNumberRequestMock('0x1'),
          buildEthBlockNumberRequestMock('0x2'),
        ],
      });

      const selectedAddress = ETHERSCAN_TRANSACTION_BASE_MOCK.to;

      const { networkController, transactionController } = await newController({
        getSelectedAddress: () => selectedAddress,
      });

      const expectedLastFetchedBlockNumbers: Record<string, number> = {};
      const expectedTransactions: Partial<TransactionMeta>[] = [];

      const networkClients = networkController.getNetworkClientRegistry();
      const networkClientIds = Object.keys(networkClients);
      await Promise.all(
        networkClientIds.map(async (networkClientId) => {
          const config = networkClients[networkClientId].configuration;
          mockNetwork({
            networkClientConfiguration: config,
            mocks: [
              buildEthBlockNumberRequestMock('0x1'),
              buildEthBlockNumberRequestMock('0x2'),
            ],
          });
          nock(getEtherscanApiHost(config.chainId))
            .get(
              `/api?module=account&address=${selectedAddress}&offset=40&sort=desc&action=txlist&tag=latest&page=1`,
            )
            .reply(200, ETHERSCAN_TRANSACTION_RESPONSE_MOCK);

          transactionController.startIncomingTransactionPolling([
            networkClientId,
          ]);

          expectedLastFetchedBlockNumbers[
            `${config.chainId}#${selectedAddress}#normal`
          ] = parseInt(ETHERSCAN_TRANSACTION_BASE_MOCK.blockNumber, 10);
          expectedTransactions.push({
            blockNumber: ETHERSCAN_TRANSACTION_BASE_MOCK.blockNumber,
            chainId: config.chainId,
            type: TransactionType.incoming,
            verifiedOnBlockchain: false,
            status: TransactionStatus.confirmed,
          });
          expectedTransactions.push({
            blockNumber: ETHERSCAN_TRANSACTION_BASE_MOCK.blockNumber,
            chainId: config.chainId,
            type: TransactionType.incoming,
            verifiedOnBlockchain: false,
            status: TransactionStatus.failed,
          });
        }),
      );
      await advanceTime({ clock, duration: BLOCK_TRACKER_POLLING_INTERVAL });

      expect(transactionController.state.transactions).toHaveLength(
        2 * networkClientIds.length,
      );
      expect(transactionController.state.transactions).toStrictEqual(
        expect.arrayContaining(
          expectedTransactions.map(expect.objectContaining),
        ),
      );
      expect(transactionController.state.lastFetchedBlockNumbers).toStrictEqual(
        expectedLastFetchedBlockNumbers,
      );
      transactionController.destroy();
    });

    it('should start the global incoming transaction helper when no networkClientIds provided', async () => {
      const selectedAddress = ETHERSCAN_TRANSACTION_BASE_MOCK.to;

      mockNetwork({
        networkClientConfiguration: buildInfuraNetworkClientConfiguration(
          InfuraNetworkType.mainnet,
        ),
        mocks: [
          buildEthBlockNumberRequestMock('0x1'),
          buildEthBlockNumberRequestMock('0x2'),
        ],
      });
      nock(getEtherscanApiHost(BUILT_IN_NETWORKS[NetworkType.mainnet].chainId))
        .get(
          `/api?module=account&address=${selectedAddress}&offset=40&sort=desc&action=txlist&tag=latest&page=1`,
        )
        .reply(200, ETHERSCAN_TRANSACTION_RESPONSE_MOCK);

      const { transactionController } = await newController({
        getSelectedAddress: () => selectedAddress,
      });

      transactionController.startIncomingTransactionPolling();

      await advanceTime({ clock, duration: BLOCK_TRACKER_POLLING_INTERVAL });

      expect(transactionController.state.transactions).toHaveLength(2);
      expect(transactionController.state.transactions).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            blockNumber: ETHERSCAN_TRANSACTION_BASE_MOCK.blockNumber,
            chainId: '0x1',
            type: TransactionType.incoming,
            verifiedOnBlockchain: false,
            status: TransactionStatus.confirmed,
          }),
          expect.objectContaining({
            blockNumber: ETHERSCAN_TRANSACTION_BASE_MOCK.blockNumber,
            chainId: '0x1',
            type: TransactionType.incoming,
            verifiedOnBlockchain: false,
            status: TransactionStatus.failed,
          }),
        ]),
      );
      expect(transactionController.state.lastFetchedBlockNumbers).toStrictEqual(
        {
          [`0x1#${selectedAddress}#normal`]: parseInt(
            ETHERSCAN_TRANSACTION_BASE_MOCK.blockNumber,
            10,
          ),
        },
      );
      transactionController.destroy();
    });

    describe('when called with multiple networkClients which share the same chainId', () => {
      it('should only call the etherscan API max every 5 seconds, alternating between the token and txlist endpoints', async () => {
        const fetchEtherscanNativeTxFetchSpy = jest.spyOn(
          etherscanUtils,
          'fetchEtherscanTransactions',
        );

        const fetchEtherscanTokenTxFetchSpy = jest.spyOn(
          etherscanUtils,
          'fetchEtherscanTokenTransactions',
        );

        // mocking infura mainnet
        mockNetwork({
          networkClientConfiguration: buildInfuraNetworkClientConfiguration(
            InfuraNetworkType.mainnet,
          ),
          mocks: [
            buildEthBlockNumberRequestMock('0x1'),
            buildEthBlockNumberRequestMock('0x2'),
          ],
        });

        // mocking infura goerli
        mockNetwork({
          networkClientConfiguration: buildInfuraNetworkClientConfiguration(
            InfuraNetworkType.goerli,
          ),
          mocks: [
            buildEthBlockNumberRequestMock('0x1'),
            buildEthBlockNumberRequestMock('0x2'),
          ],
        });

        // mock the other goerli network client node requests
        mockNetwork({
          networkClientConfiguration: {
            type: NetworkClientType.Custom,
            chainId: BUILT_IN_NETWORKS[NetworkType.goerli].chainId,
            ticker: BUILT_IN_NETWORKS[NetworkType.goerli].ticker,
            rpcUrl: 'https://mock.rpc.url',
          },
          mocks: [
            buildEthBlockNumberRequestMock('0x1'),
            buildEthBlockNumberRequestMock('0x2'),
            buildEthBlockNumberRequestMock('0x3'),
            buildEthBlockNumberRequestMock('0x4'),
          ],
        });

        const selectedAddress = ETHERSCAN_TRANSACTION_BASE_MOCK.to;

        const { networkController, transactionController } =
          await newController({
            getSelectedAddress: () => selectedAddress,
          });

        const otherGoerliClientNetworkClientId =
          await networkController.upsertNetworkConfiguration(
            customGoerliNetworkClientConfiguration,
            {
              referrer: 'https://mock.referrer',
              source: 'dapp',
            },
          );

        // Etherscan API Mocks

        // Non-token transactions
        nock(getEtherscanApiHost(BUILT_IN_NETWORKS[NetworkType.goerli].chainId))
          .get(
            `/api?module=account&address=${ETHERSCAN_TRANSACTION_BASE_MOCK.to}&offset=40&sort=desc&action=txlist&tag=latest&page=1`,
          )
          .reply(200, {
            status: '1',
            result: [{ ...ETHERSCAN_TRANSACTION_SUCCESS_MOCK, blockNumber: 1 }],
          })
          // block 2
          .get(
            `/api?module=account&address=${ETHERSCAN_TRANSACTION_BASE_MOCK.to}&startBlock=2&offset=40&sort=desc&action=txlist&tag=latest&page=1`,
          )
          .reply(200, {
            status: '1',
            result: [{ ...ETHERSCAN_TRANSACTION_SUCCESS_MOCK, blockNumber: 2 }],
          })
          .persist();

        // token transactions
        nock(getEtherscanApiHost(BUILT_IN_NETWORKS[NetworkType.goerli].chainId))
          .get(
            `/api?module=account&address=${ETHERSCAN_TRANSACTION_BASE_MOCK.to}&offset=40&sort=desc&action=tokentx&tag=latest&page=1`,
          )
          .reply(200, {
            status: '1',
            result: [{ ...ETHERSCAN_TOKEN_TRANSACTION_MOCK, blockNumber: 1 }],
          })
          .get(
            `/api?module=account&address=${ETHERSCAN_TRANSACTION_BASE_MOCK.to}&startBlock=2&offset=40&sort=desc&action=tokentx&tag=latest&page=1`,
          )
          .reply(200, {
            status: '1',
            result: [{ ...ETHERSCAN_TOKEN_TRANSACTION_MOCK, blockNumber: 2 }],
          })
          .persist();

        // start polling with two clients which share the same chainId
        transactionController.startIncomingTransactionPolling([
          NetworkType.goerli,
          otherGoerliClientNetworkClientId,
        ]);
        await advanceTime({ clock, duration: 1 });
        expect(fetchEtherscanNativeTxFetchSpy).toHaveBeenCalledTimes(1);
        expect(fetchEtherscanTokenTxFetchSpy).toHaveBeenCalledTimes(0);
        await advanceTime({ clock, duration: 4999 });
        // after 5 seconds we can call to the etherscan API again, this time to the token transactions endpoint
        expect(fetchEtherscanNativeTxFetchSpy).toHaveBeenCalledTimes(1);
        expect(fetchEtherscanTokenTxFetchSpy).toHaveBeenCalledTimes(1);
        await advanceTime({ clock, duration: 5000 });
        // after another 5 seconds there should be no new calls to the etherscan API
        // since no new blocks events have occurred
        expect(fetchEtherscanNativeTxFetchSpy).toHaveBeenCalledTimes(1);
        expect(fetchEtherscanTokenTxFetchSpy).toHaveBeenCalledTimes(1);
        // next block arrives after 20 seconds elapsed from first call
        await advanceTime({ clock, duration: 10000 });
        await advanceTime({ clock, duration: 1 }); // flushes extra promises/setTimeouts
        // first the native transactions are fetched
        expect(fetchEtherscanNativeTxFetchSpy).toHaveBeenCalledTimes(2);
        expect(fetchEtherscanTokenTxFetchSpy).toHaveBeenCalledTimes(1);
        await advanceTime({ clock, duration: 4000 });
        // no new calls to the etherscan API since 5 seconds have not passed
        expect(fetchEtherscanNativeTxFetchSpy).toHaveBeenCalledTimes(2);
        expect(fetchEtherscanTokenTxFetchSpy).toHaveBeenCalledTimes(1);
        await advanceTime({ clock, duration: 1000 }); // flushes extra promises/setTimeouts
        // then once 5 seconds have passed since the previous call to the etherscan API
        // we call the token transactions endpoint
        expect(fetchEtherscanNativeTxFetchSpy).toHaveBeenCalledTimes(2);
        expect(fetchEtherscanTokenTxFetchSpy).toHaveBeenCalledTimes(2);

        transactionController.destroy();
      });
    });
  });

  describe('stopIncomingTransactionPolling', () => {
    it('should not poll for new incoming transactions for the given networkClientId', async () => {
      const selectedAddress = ETHERSCAN_TRANSACTION_BASE_MOCK.to;

      const { networkController, transactionController } = await newController({
        getSelectedAddress: () => selectedAddress,
      });

      const networkClients = networkController.getNetworkClientRegistry();
      const networkClientIds = Object.keys(networkClients);
      await Promise.all(
        networkClientIds.map(async (networkClientId) => {
          const config = networkClients[networkClientId].configuration;
          mockNetwork({
            networkClientConfiguration: config,
            mocks: [
              buildEthBlockNumberRequestMock('0x1'),
              buildEthBlockNumberRequestMock('0x2'),
            ],
          });
          nock(getEtherscanApiHost(config.chainId))
            .get(
              `/api?module=account&address=${selectedAddress}&offset=40&sort=desc&action=txlist&tag=latest&page=1`,
            )
            .reply(200, ETHERSCAN_TRANSACTION_RESPONSE_MOCK);

          transactionController.startIncomingTransactionPolling([
            networkClientId,
          ]);

          transactionController.stopIncomingTransactionPolling([
            networkClientId,
          ]);
        }),
      );
      await advanceTime({ clock, duration: BLOCK_TRACKER_POLLING_INTERVAL });

      expect(transactionController.state.transactions).toStrictEqual([]);
      expect(transactionController.state.lastFetchedBlockNumbers).toStrictEqual(
        {},
      );
      transactionController.destroy();
    });

    it('should stop the global incoming transaction helper when no networkClientIds provided', async () => {
      const selectedAddress = ETHERSCAN_TRANSACTION_BASE_MOCK.to;

      const { transactionController } = await newController({
        getSelectedAddress: () => selectedAddress,
      });

      mockNetwork({
        networkClientConfiguration: buildInfuraNetworkClientConfiguration(
          InfuraNetworkType.mainnet,
        ),
        mocks: [
          buildEthBlockNumberRequestMock('0x1'),
          buildEthBlockNumberRequestMock('0x2'),
        ],
      });
      nock(getEtherscanApiHost(BUILT_IN_NETWORKS[NetworkType.mainnet].chainId))
        .get(
          `/api?module=account&address=${selectedAddress}&offset=40&sort=desc&action=txlist&tag=latest&page=1`,
        )
        .reply(200, ETHERSCAN_TRANSACTION_RESPONSE_MOCK);

      transactionController.startIncomingTransactionPolling();

      transactionController.stopIncomingTransactionPolling();
      await advanceTime({ clock, duration: BLOCK_TRACKER_POLLING_INTERVAL });

      expect(transactionController.state.transactions).toStrictEqual([]);
      expect(transactionController.state.lastFetchedBlockNumbers).toStrictEqual(
        {},
      );
      transactionController.destroy();
    });
  });

  describe('stopAllIncomingTransactionPolling', () => {
    it('should not poll for incoming transactions on any network client', async () => {
      const selectedAddress = ETHERSCAN_TRANSACTION_BASE_MOCK.to;

      const { networkController, transactionController } = await newController({
        getSelectedAddress: () => selectedAddress,
      });

      const networkClients = networkController.getNetworkClientRegistry();
      const networkClientIds = Object.keys(networkClients);
      await Promise.all(
        networkClientIds.map(async (networkClientId) => {
          const config = networkClients[networkClientId].configuration;
          mockNetwork({
            networkClientConfiguration: config,
            mocks: [
              buildEthBlockNumberRequestMock('0x1'),
              buildEthBlockNumberRequestMock('0x2'),
            ],
          });
          nock(getEtherscanApiHost(config.chainId))
            .get(
              `/api?module=account&address=${selectedAddress}&offset=40&sort=desc&action=txlist&tag=latest&page=1`,
            )
            .reply(200, ETHERSCAN_TRANSACTION_RESPONSE_MOCK);

          transactionController.startIncomingTransactionPolling([
            networkClientId,
          ]);
        }),
      );

      transactionController.stopAllIncomingTransactionPolling();
      await advanceTime({ clock, duration: BLOCK_TRACKER_POLLING_INTERVAL });

      expect(transactionController.state.transactions).toStrictEqual([]);
      expect(transactionController.state.lastFetchedBlockNumbers).toStrictEqual(
        {},
      );
      transactionController.destroy();
    });
  });

  describe('updateIncomingTransactions', () => {
    it('should add incoming transactions to state with the correct chainId for the given networkClientId without waiting for the next block', async () => {
      const selectedAddress = ETHERSCAN_TRANSACTION_BASE_MOCK.to;

      const { networkController, transactionController } = await newController({
        getSelectedAddress: () => selectedAddress,
      });

      const expectedLastFetchedBlockNumbers: Record<string, number> = {};
      const expectedTransactions: Partial<TransactionMeta>[] = [];

      const networkClients = networkController.getNetworkClientRegistry();
      const networkClientIds = Object.keys(networkClients);
      await Promise.all(
        networkClientIds.map(async (networkClientId) => {
          const config = networkClients[networkClientId].configuration;
          mockNetwork({
            networkClientConfiguration: config,
            mocks: [buildEthBlockNumberRequestMock('0x1')],
          });
          nock(getEtherscanApiHost(config.chainId))
            .get(
              `/api?module=account&address=${selectedAddress}&offset=40&sort=desc&action=txlist&tag=latest&page=1`,
            )
            .reply(200, ETHERSCAN_TRANSACTION_RESPONSE_MOCK);

          transactionController.updateIncomingTransactions([networkClientId]);

          expectedLastFetchedBlockNumbers[
            `${config.chainId}#${selectedAddress}#normal`
          ] = parseInt(ETHERSCAN_TRANSACTION_BASE_MOCK.blockNumber, 10);
          expectedTransactions.push({
            blockNumber: ETHERSCAN_TRANSACTION_BASE_MOCK.blockNumber,
            chainId: config.chainId,
            type: TransactionType.incoming,
            verifiedOnBlockchain: false,
            status: TransactionStatus.confirmed,
          });
          expectedTransactions.push({
            blockNumber: ETHERSCAN_TRANSACTION_BASE_MOCK.blockNumber,
            chainId: config.chainId,
            type: TransactionType.incoming,
            verifiedOnBlockchain: false,
            status: TransactionStatus.failed,
          });
        }),
      );

      // we have to wait for the mutex to be released after the 5 second API rate limit timer
      await advanceTime({ clock, duration: 1 });

      expect(transactionController.state.transactions).toHaveLength(
        2 * networkClientIds.length,
      );
      expect(transactionController.state.transactions).toStrictEqual(
        expect.arrayContaining(
          expectedTransactions.map(expect.objectContaining),
        ),
      );
      expect(transactionController.state.lastFetchedBlockNumbers).toStrictEqual(
        expectedLastFetchedBlockNumbers,
      );
      transactionController.destroy();
    });

    it('should update the incoming transactions for the gloablly selected network when no networkClientIds provided', async () => {
      const selectedAddress = ETHERSCAN_TRANSACTION_BASE_MOCK.to;

      const { transactionController } = await newController({
        getSelectedAddress: () => selectedAddress,
      });

      mockNetwork({
        networkClientConfiguration: buildInfuraNetworkClientConfiguration(
          InfuraNetworkType.mainnet,
        ),
        mocks: [buildEthBlockNumberRequestMock('0x1')],
      });
      nock(getEtherscanApiHost(BUILT_IN_NETWORKS[NetworkType.mainnet].chainId))
        .get(
          `/api?module=account&address=${selectedAddress}&offset=40&sort=desc&action=txlist&tag=latest&page=1`,
        )
        .reply(200, ETHERSCAN_TRANSACTION_RESPONSE_MOCK);

      transactionController.updateIncomingTransactions();

      // we have to wait for the mutex to be released after the 5 second API rate limit timer
      await advanceTime({ clock, duration: 1 });

      expect(transactionController.state.transactions).toHaveLength(2);
      expect(transactionController.state.transactions).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            blockNumber: ETHERSCAN_TRANSACTION_BASE_MOCK.blockNumber,
            chainId: '0x1',
            type: TransactionType.incoming,
            verifiedOnBlockchain: false,
            status: TransactionStatus.confirmed,
          }),
          expect.objectContaining({
            blockNumber: ETHERSCAN_TRANSACTION_BASE_MOCK.blockNumber,
            chainId: '0x1',
            type: TransactionType.incoming,
            verifiedOnBlockchain: false,
            status: TransactionStatus.failed,
          }),
        ]),
      );
      expect(transactionController.state.lastFetchedBlockNumbers).toStrictEqual(
        {
          [`0x1#${selectedAddress}#normal`]: parseInt(
            ETHERSCAN_TRANSACTION_BASE_MOCK.blockNumber,
            10,
          ),
        },
      );
      transactionController.destroy();
    });
  });

  describe('getNonceLock', () => {
    it('should get the nonce lock from the nonceTracker for the given networkClientId', async () => {
      const { networkController, transactionController } = await newController(
        {},
      );

      const networkClients = networkController.getNetworkClientRegistry();
      const networkClientIds = Object.keys(networkClients);
      await Promise.all(
        networkClientIds.map(async (networkClientId) => {
          const config = networkClients[networkClientId].configuration;
          mockNetwork({
            networkClientConfiguration: config,
            mocks: [
              buildEthBlockNumberRequestMock('0x1'),
              buildEthGetTransactionCountRequestMock(
                ACCOUNT_MOCK,
                '0x1',
                '0xa',
              ),
            ],
          });

          const nonceLockPromise = transactionController.getNonceLock(
            ACCOUNT_MOCK,
            networkClientId,
          );
          await advanceTime({ clock, duration: 1 });

          const nonceLock = await nonceLockPromise;

          expect(nonceLock.nextNonce).toBe(10);
        }),
      );
      transactionController.destroy();
    });

    it('should block attempts to get the nonce lock for the same address from the nonceTracker for the networkClientId until the previous lock is released', async () => {
      const { networkController, transactionController } = await newController(
        {},
      );

      const networkClients = networkController.getNetworkClientRegistry();
      const networkClientIds = Object.keys(networkClients);
      await Promise.all(
        networkClientIds.map(async (networkClientId) => {
          const config = networkClients[networkClientId].configuration;
          mockNetwork({
            networkClientConfiguration: config,
            mocks: [
              buildEthBlockNumberRequestMock('0x1'),
              buildEthGetTransactionCountRequestMock(
                ACCOUNT_MOCK,
                '0x1',
                '0xa',
              ),
            ],
          });

          const firstNonceLockPromise = transactionController.getNonceLock(
            ACCOUNT_MOCK,
            networkClientId,
          );
          await advanceTime({ clock, duration: 1 });

          const firstNonceLock = await firstNonceLockPromise;

          expect(firstNonceLock.nextNonce).toBe(10);

          const secondNonceLockPromise = transactionController.getNonceLock(
            ACCOUNT_MOCK,
            networkClientId,
          );
          const delay = () =>
            new Promise<null>(async (resolve) => {
              await advanceTime({ clock, duration: 100 });
              resolve(null);
            });

          let secondNonceLockIfAcquired = await Promise.race([
            secondNonceLockPromise,
            delay(),
          ]);
          expect(secondNonceLockIfAcquired).toBeNull();

          await firstNonceLock.releaseLock();
          await advanceTime({ clock, duration: 1 });

          secondNonceLockIfAcquired = await Promise.race([
            secondNonceLockPromise,
            delay(),
          ]);
          expect(secondNonceLockIfAcquired?.nextNonce).toBe(10);
        }),
      );
      transactionController.destroy();
    });

    it('should block attempts to get the nonce lock for the same address from the nonceTracker for the different networkClientIds on the same chainId until the previous lock is released', async () => {
      const { networkController, transactionController } = await newController(
        {},
      );
      mockNetwork({
        networkClientConfiguration: buildInfuraNetworkClientConfiguration(
          InfuraNetworkType.goerli,
        ),
        mocks: [
          buildEthBlockNumberRequestMock('0x1'),
          buildEthGetTransactionCountRequestMock(ACCOUNT_MOCK, '0x1', '0xa'),
        ],
      });

      mockNetwork({
        networkClientConfiguration: customGoerliNetworkClientConfiguration,
        mocks: [
          buildEthBlockNumberRequestMock('0x1'),
          buildEthGetTransactionCountRequestMock(ACCOUNT_MOCK, '0x1', '0xa'),
        ],
      });

      const otherNetworkClientIdOnGoerli =
        await networkController.upsertNetworkConfiguration(
          customGoerliNetworkClientConfiguration,
          {
            referrer: 'https://mock.referrer',
            source: 'dapp',
          },
        );

      const firstNonceLockPromise = transactionController.getNonceLock(
        ACCOUNT_MOCK,
        'goerli',
      );
      await advanceTime({ clock, duration: 1 });

      const firstNonceLock = await firstNonceLockPromise;

      expect(firstNonceLock.nextNonce).toBe(10);

      const secondNonceLockPromise = transactionController.getNonceLock(
        ACCOUNT_MOCK,
        otherNetworkClientIdOnGoerli,
      );
      const delay = () =>
        new Promise<null>(async (resolve) => {
          await advanceTime({ clock, duration: 100 });
          resolve(null);
        });

      let secondNonceLockIfAcquired = await Promise.race([
        secondNonceLockPromise,
        delay(),
      ]);
      expect(secondNonceLockIfAcquired).toBeNull();

      await firstNonceLock.releaseLock();
      await advanceTime({ clock, duration: 1 });

      secondNonceLockIfAcquired = await Promise.race([
        secondNonceLockPromise,
        delay(),
      ]);
      expect(secondNonceLockIfAcquired?.nextNonce).toBe(10);

      transactionController.destroy();
    });

    it('should not block attempts to get the nonce lock for the same addresses from the nonceTracker for different networkClientIds', async () => {
      const { transactionController } = await newController({});

      mockNetwork({
        networkClientConfiguration: buildInfuraNetworkClientConfiguration(
          InfuraNetworkType.goerli,
        ),
        mocks: [
          buildEthBlockNumberRequestMock('0x1'),
          buildEthGetTransactionCountRequestMock(ACCOUNT_MOCK, '0x1', '0xa'),
        ],
      });

      mockNetwork({
        networkClientConfiguration: buildInfuraNetworkClientConfiguration(
          InfuraNetworkType.sepolia,
        ),
        mocks: [
          buildEthBlockNumberRequestMock('0x1'),
          buildEthGetTransactionCountRequestMock(ACCOUNT_MOCK, '0x1', '0xf'),
        ],
      });

      const firstNonceLockPromise = transactionController.getNonceLock(
        ACCOUNT_MOCK,
        'goerli',
      );
      await advanceTime({ clock, duration: 1 });

      const firstNonceLock = await firstNonceLockPromise;

      expect(firstNonceLock.nextNonce).toBe(10);

      const secondNonceLockPromise = transactionController.getNonceLock(
        ACCOUNT_MOCK,
        'sepolia',
      );
      await advanceTime({ clock, duration: 1 });

      const secondNonceLock = await secondNonceLockPromise;

      expect(secondNonceLock.nextNonce).toBe(15);

      transactionController.destroy();
    });

    it('should not block attempts to get the nonce lock for different addresses from the nonceTracker for the networkClientId', async () => {
      const { networkController, transactionController } = await newController(
        {},
      );

      const networkClients = networkController.getNetworkClientRegistry();
      const networkClientIds = Object.keys(networkClients);
      await Promise.all(
        networkClientIds.map(async (networkClientId) => {
          const config = networkClients[networkClientId].configuration;
          mockNetwork({
            networkClientConfiguration: config,
            mocks: [
              buildEthBlockNumberRequestMock('0x1'),
              buildEthGetTransactionCountRequestMock(
                ACCOUNT_MOCK,
                '0x1',
                '0xa',
              ),
              buildEthGetTransactionCountRequestMock(
                ACCOUNT_2_MOCK,
                '0x1',
                '0xf',
              ),
            ],
          });

          const firstNonceLockPromise = transactionController.getNonceLock(
            ACCOUNT_MOCK,
            networkClientId,
          );
          await advanceTime({ clock, duration: 1 });

          const firstNonceLock = await firstNonceLockPromise;

          expect(firstNonceLock.nextNonce).toBe(10);

          const secondNonceLockPromise = transactionController.getNonceLock(
            ACCOUNT_2_MOCK,
            networkClientId,
          );
          await advanceTime({ clock, duration: 1 });

          const secondNonceLock = await secondNonceLockPromise;

          expect(secondNonceLock.nextNonce).toBe(15);
        }),
      );
      transactionController.destroy();
    });

    it('should get the nonce lock from the globally selected nonceTracker if no networkClientId is provided', async () => {
      mockNetwork({
        networkClientConfiguration: buildInfuraNetworkClientConfiguration(
          InfuraNetworkType.mainnet,
        ),
        mocks: [
          buildEthBlockNumberRequestMock('0x1'),
          buildEthGetTransactionCountRequestMock(ACCOUNT_MOCK, '0x1', '0xa'),
        ],
      });

      const { transactionController } = await newController({});

      const nonceLockPromise = transactionController.getNonceLock(ACCOUNT_MOCK);
      await advanceTime({ clock, duration: 1 });

      const nonceLock = await nonceLockPromise;

      expect(nonceLock.nextNonce).toBe(10);
      transactionController.destroy();
    });

    it('should block attempts to get the nonce lock from the globally selected NonceTracker for the same address until the previous lock is released', async () => {
      mockNetwork({
        networkClientConfiguration: buildInfuraNetworkClientConfiguration(
          InfuraNetworkType.mainnet,
        ),
        mocks: [
          buildEthBlockNumberRequestMock('0x1'),
          buildEthGetTransactionCountRequestMock(ACCOUNT_MOCK, '0x1', '0xa'),
        ],
      });

      const { transactionController } = await newController({});

      const firstNonceLockPromise =
        transactionController.getNonceLock(ACCOUNT_MOCK);
      await advanceTime({ clock, duration: 1 });

      const firstNonceLock = await firstNonceLockPromise;

      expect(firstNonceLock.nextNonce).toBe(10);

      const secondNonceLockPromise =
        transactionController.getNonceLock(ACCOUNT_MOCK);
      const delay = () =>
        new Promise<null>(async (resolve) => {
          await advanceTime({ clock, duration: 100 });
          resolve(null);
        });

      let secondNonceLockIfAcquired = await Promise.race([
        secondNonceLockPromise,
        delay(),
      ]);
      expect(secondNonceLockIfAcquired).toBeNull();

      await firstNonceLock.releaseLock();

      secondNonceLockIfAcquired = await Promise.race([
        secondNonceLockPromise,
        delay(),
      ]);
      expect(secondNonceLockIfAcquired?.nextNonce).toBe(10);
      transactionController.destroy();
    });

    it('should not block attempts to get the nonce lock from the globally selected nonceTracker for different addresses', async () => {
      mockNetwork({
        networkClientConfiguration: buildInfuraNetworkClientConfiguration(
          InfuraNetworkType.mainnet,
        ),
        mocks: [
          buildEthBlockNumberRequestMock('0x1'),
          buildEthGetTransactionCountRequestMock(ACCOUNT_MOCK, '0x1', '0xa'),
          buildEthGetTransactionCountRequestMock(ACCOUNT_2_MOCK, '0x1', '0xf'),
        ],
      });

      const { transactionController } = await newController({});

      const firstNonceLockPromise =
        transactionController.getNonceLock(ACCOUNT_MOCK);
      await advanceTime({ clock, duration: 1 });

      const firstNonceLock = await firstNonceLockPromise;

      expect(firstNonceLock.nextNonce).toBe(10);

      const secondNonceLockPromise =
        transactionController.getNonceLock(ACCOUNT_2_MOCK);
      await advanceTime({ clock, duration: 1 });

      const secondNonceLock = await secondNonceLockPromise;

      expect(secondNonceLock.nextNonce).toBe(15);

      transactionController.destroy();
    });
  });
});
