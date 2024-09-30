import { Core } from '@walletconnect/core';
import { ErrorResponse } from '@walletconnect/jsonrpc-types';
import { SessionTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';
import { SubjectType } from '@metamask/subject-metadata-controller';
import { isHexString } from 'ethereumjs-util';
import Client, { SingleEthereum, SingleEthereumTypes } from '../../lib/se-sdk';
import { getAllUrlParams } from '../../../../shared/lib/getAllUrlParams.util';

import {
  decimalToHex,
  hexToDecimal,
} from '../../../../shared/modules/conversion.utils';
// import { ChainProvider } from '../network/chain-provider';
// import { STATIC_MAINNET_TOKEN_LIST } from '../../../../shared/constants/tokens';
import { ApprovalType } from '../../../overrided-metamask/controller-utils';
import parseWalletConnectUri, {
  waitForNetworkModalOnboarding,
} from './wc-utils';
import { METHODS_TO_REDIRECT, WALLET_CONNECT, DEEPLINKS } from './wc-config';
import { WalletManagerOptions } from './types';

export const isWC2Enabled =
  typeof WALLET_CONNECT.PROJECT_ID === 'string' &&
  WALLET_CONNECT.PROJECT_ID?.length > 0;

const ERROR_MESSAGES = {
  INVALID_CHAIN: 'Invalid chainId',
  MANUAL_DISCONNECT: 'Manual disconnect',
  USER_REJECT: 'User reject',
  AUTO_REMOVE: 'Automatic removal',
  INVALID_ID: 'Invalid Id',
};

const ERROR_CODES = {
  USER_REJECT_CODE: 5000,
};

const RPC_WALLET_SWITCHETHEREUMCHAIN = 'wallet_switchEthereumChain';

class WalletConnect2Session {
  private web3Wallet: Client;

  private deeplink: boolean;

  private session: SessionTypes.Struct;

  private wcOptions: WalletManagerOptions;

  private requestsToRedirect: { [request: string]: boolean } = {};

  private topicByRequestId: { [requestId: string]: string } = {};

  private requestByRequestId: {
    [requestId: string]: SingleEthereumTypes.SessionRequest;
  } = {};

  constructor({
    web3Wallet,
    session,
    deeplink,
    wcOptions,
  }: {
    web3Wallet: Client;
    session: SessionTypes.Struct;
    deeplink: boolean;
    wcOptions: WalletManagerOptions;
  }) {
    this.web3Wallet = web3Wallet;
    this.deeplink = deeplink;
    this.session = session;
    this.wcOptions = wcOptions;
  }

  setDeeplink = (deeplink: boolean) => {
    this.deeplink = deeplink;
  };

  redirect = () => {
    return;

    if (!this.deeplink) {
      return;
    }

    // setTimeout(() => {
    //   Minimizer.goBack();
    // }, 300);
  };

  needsRedirect = (id: string) => {
    if (this.requestsToRedirect[id]) {
      delete this.requestsToRedirect[id];
      this.redirect();
    }
  };

  approveRequest = async ({ id, result }: { id: string; result: unknown }) => {
    const topic = this.topicByRequestId[id];
    const initialRequest = this.requestByRequestId[id];

    // Special case for eth_switchNetwork to wait for the modal to be closed
    if (
      initialRequest?.params.request.method === RPC_WALLET_SWITCHETHEREUMCHAIN
    ) {
      try {
        const params = initialRequest.params.request.params as unknown[];
        const { chainId } = params[0] as { chainId: string };

        if (chainId) {
          await waitForNetworkModalOnboarding({
            chainId: `${parseInt(chainId, 10)}`,
          });
        }
      } catch (err) {
        // Ignore error as it is not critical when timeout for modal is reached
        // It allows to safely continue and prc pilling up the requests.
      }
    }

    try {
      await this.web3Wallet.approveRequest({
        id: parseInt(id, 10),
        topic,
        result,
      });
    } catch (err) {
      console.warn(
        `WC2::approveRequest error while approving request id=${id} topic=${topic}`,
        err,
      );
    }

    this.needsRedirect(id);
  };

  rejectRequest = async ({ id, error }: { id: string; error: unknown }) => {
    const topic = this.topicByRequestId[id];

    let errorMsg = '';
    if (error instanceof Error) {
      errorMsg = error.message;
    } else if (typeof error === 'string') {
      errorMsg = error;
    } else {
      errorMsg = JSON.stringify(error);
    }

    // Convert error to correct format
    const errorResponse: ErrorResponse = {
      code: ERROR_CODES.USER_REJECT_CODE,
      message: errorMsg,
    };

    try {
      await this.web3Wallet.rejectRequest({
        id: parseInt(id, 10),
        topic,
        error: errorResponse,
      });
    } catch (err) {
      console.warn(
        `WC2::rejectRequest error while rejecting request id=${id} topic=${topic}`,
        err,
      );
    }

    this.needsRedirect(id);
  };

  updateSession = async ({
    chainId,
    accounts,
  }: {
    chainId: string;
    accounts: string[];
  }) => {
    try {
      await this.web3Wallet.updateSession({
        topic: this.session.topic,
        chainId: parseInt(chainId, 10),
        accounts,
      });
    } catch (err) {
      console.warn(
        `WC2::updateSession can't update session topic=${this.session.topic}`,
        err,
      );
    }
  };

  handleRequest = async (requestEvent: SingleEthereumTypes.SessionRequest) => {
    this.topicByRequestId[requestEvent.id] = requestEvent.topic;
    this.requestByRequestId[requestEvent.id] = requestEvent;

    const verified = requestEvent.verifyContext?.verified;
    const hostname = verified?.origin;
    // const origin = WALLET_CONNECT_ORIGIN + hostname; // allow correct origin for analytics with eth_sendTtansaction

    let { method } = requestEvent.params.request;
    const chainId = parseInt(requestEvent.params.chainId, 10);
    const hexChainId = `0x${decimalToHex(chainId)}`;
    const methodParams = requestEvent.params.request.params as any;
    console.info(
      `WalletConnect2Session::handleRequest chainId=${chainId} method=${method}`,
      methodParams,
    );

    // Manage redirects
    if (METHODS_TO_REDIRECT[method]) {
      this.requestsToRedirect[requestEvent.id] = true;
    }

    if (method === 'eth_sendTransaction') {
      try {
        // DEXTRADE
        const [txParams] = methodParams;
        txParams.localId = hexChainId;
        const hash =
          await this.wcOptions.transactionController.newUnapprovedTransaction(
            txParams,
            {
              method,
              origin: hostname,
              id: requestEvent.id,
            },
          );
        // Sequrity check. TODO: Return in dextrade at future
        //
        // const { id } = trx.transactionMeta;
        // const reqObject = {
        //   jsonrpc: '2.0',
        //   method: 'eth_sendTransaction',
        //   params: [
        //     {
        //       from: methodParams[0].from,
        //       to: methodParams[0].to,
        //       value: methodParams[0].value,
        //     },
        //   ],
        // };
        // ppomUtil.validateRequest(reqObject, id);

        await this.approveRequest({ id: `${requestEvent.id}`, result: hash });
      } catch (error) {
        await this.rejectRequest({ id: `${requestEvent.id}`, error });
      }
    } else if (method === 'eth_signTypedData') {
      // Overwrite 'eth_signTypedData' because otherwise metamask use incorrect param order to parse the request.
      method = 'eth_signTypedData_v3';
    } else if (method === 'personal_sign') {
      const result =
        await this.wcOptions.signController.newUnsignedPersonalMessage(
          {
            from: methodParams[1],
            data: methodParams[0],
            origin: hostname,
          },
          {
            origin: hostname,
          },
        );
      await this.approveRequest({ id: `${requestEvent.id}`, result });
    } else {
      this.approveRequest({ id: String(requestEvent.id), result: null });
    }
  };
}

export class WC2Manager {
  private static instance: WC2Manager;

  private wcOptions: WalletManagerOptions;

  // private static _initialized = false;

  private web3Wallet: Client;

  private sessions: { [topic: string]: WalletConnect2Session } = {};

  private deeplinkSessions: {
    [pairingTopic: string]: { redirectUrl?: string; origin: string };
  } = {};

  private constructor(
    web3Wallet: Client,
    deeplinkSessions: {
      [topic: string]: { redirectUrl?: string; origin: string };
    },
    wcOptions: WalletManagerOptions,
  ) {
    this.web3Wallet = web3Wallet;
    this.deeplinkSessions = deeplinkSessions || {};
    this.wcOptions = wcOptions;

    const sessions = web3Wallet.getActiveSessions() || {};

    web3Wallet.on('session_proposal', this.onSessionProposal.bind(this));
    web3Wallet.on('session_request', this.onSessionRequest.bind(this));
    web3Wallet.on(
      'session_delete',
      async (event: SingleEthereumTypes.SessionDelete) => {
        const session = sessions[event.topic];
        if (session && this.deeplinkSessions[session?.pairingTopic]) {
          delete this.deeplinkSessions[session.pairingTopic];
          this.wcOptions.storage.setItem(
            WALLET_CONNECT.DEEPLINK_SESSIONS,
            this.deeplinkSessions,
          );
        }
      },
    );
    const selectedAddress =
      this.wcOptions.preferencesController.getSelectedAddress();
    // TODO: Misleading variable name, this is not the chain ID. This should be updated to use the chain ID.
    const chainId = '0x1';

    Object.keys(sessions).forEach(async (sessionKey) => {
      try {
        const session = sessions[sessionKey];
        this.sessions[sessionKey] = new WalletConnect2Session({
          web3Wallet,
          deeplink:
            typeof this.deeplinkSessions[session.pairingTopic] !== 'undefined',
          session,
          wcOptions,
        });

        await this.sessions[sessionKey].updateSession({
          chainId,
          accounts: [selectedAddress],
        });
      } catch (err) {
        console.warn(`WC2::init can't update session ${sessionKey}`);
      }
    });
  }

  public static async init(wcOptions: WalletManagerOptions) {
    if (this.instance) {
      // already initialized
      return this.instance;
    }

    // Keep at the beginning to prevent double instance from react strict double rendering
    // this._initialized = true;

    let core;
    try {
      if (typeof WALLET_CONNECT.PROJECT_ID === 'string') {
        core = new Core({
          storage: wcOptions.storage,
          projectId: WALLET_CONNECT.PROJECT_ID,
          logger: 'fatal',
        });
      } else {
        throw new Error('WC2::init Init Missing projectId');
      }
    } catch (err) {
      console.warn(`WC2::init Init failed due to ${err}`);
      throw err;
    }

    let web3Wallet;
    const options: SingleEthereumTypes.Options = {
      core: core as any,
      metadata: WALLET_CONNECT.METADATA,
    };
    try {
      web3Wallet = await SingleEthereum.init(options);
    } catch (err) {
      // TODO Sometime needs to init twice --- not sure why...
      web3Wallet = await SingleEthereum.init(options);
    }

    let deeplinkSessions = {};
    try {
      deeplinkSessions = wcOptions.storage.getItem(
        WALLET_CONNECT.DEEPLINK_SESSIONS,
      );
    } catch (err) {
      console.warn(`WC2@init() Failed to parse storage values`);
    }
    this.instance = new WC2Manager(web3Wallet, deeplinkSessions, wcOptions);

    return this.instance;
  }

  public static async getInstance(): Promise<WC2Manager> {
    let waitCount = 1;
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (this.instance) {
          if (waitCount % 10 === 0) {
            console.warn(
              `WalletConnectV2::getInstance() slow waitCount=${waitCount}`,
            );
          }
          clearInterval(interval);
          resolve(this.instance);
        }
        waitCount += 1;
      }, 100);
    });
  }

  public getSessions(): SessionTypes.Struct[] {
    const actives = this.web3Wallet.getActiveSessions() || {};
    const sessions: SessionTypes.Struct[] = [];
    Object.keys(actives).forEach(async (sessionKey) => {
      const session = actives[sessionKey];
      sessions.push(session);
    });
    return sessions;
  }

  public async removeSession(session: SessionTypes.Struct) {
    try {
      await this.web3Wallet.disconnectSession({
        topic: session.topic,
        error: { code: 1, message: ERROR_MESSAGES.MANUAL_DISCONNECT },
      });
    } catch (err) {
      // Fallback method because of bug in wc2 sdk
      await this.web3Wallet.engine.web3wallet.engine.signClient.session.delete(
        session.topic,
        getSdkError('USER_DISCONNECTED'),
      );
    }
  }

  public async removeAll() {
    this.deeplinkSessions = {};
    const actives = this.web3Wallet.getActiveSessions() || {};
    Object.values(actives).forEach(async (session) => {
      this.web3Wallet
        .disconnectSession({
          topic: session.topic,
          error: { code: 1, message: ERROR_MESSAGES.MANUAL_DISCONNECT },
        })
        .catch((err) => {
          console.warn(`Can't remove active session ${session.topic}`, err);
        });
    });

    await this.wcOptions.storage.setItem(
      WALLET_CONNECT.DEEPLINK_SESSIONS,
      this.deeplinkSessions,
    );
  }

  public async removePendings() {
    const pending = this.web3Wallet.getPendingSessionProposals() || {};
    Object.values(pending).forEach(async (session) => {
      this.web3Wallet
        .rejectSession({
          id: session.id,
          error: { code: 1, message: ERROR_MESSAGES.AUTO_REMOVE },
        })
        .catch((err) => {
          console.warn(`Can't remove pending session ${session.id}`, err);
        });
    });

    const requests = this.web3Wallet.getPendingSessionRequests() || [];
    requests.forEach(async (request) => {
      try {
        await this.web3Wallet.rejectRequest({
          id: request.id,
          topic: request.topic,
          error: { code: 1, message: ERROR_MESSAGES.USER_REJECT },
        });
      } catch (err) {
        console.warn(`Can't remove request ${request.id}`, err);
      }
    });
  }

  async onSessionProposal(proposal: SingleEthereumTypes.SessionProposal) {
    //  Open session proposal modal for confirmation / rejection
    const { id, params } = proposal;
    const { proposer } = params;
    const requiredChainIds = params.optionalNamespaces.eip155.chains || [];
    const requiredMethods = params.optionalNamespaces.eip155.methods || [];
    const permissions = requiredMethods.reduce(
      (acc, method) => ({ ...acc, [method]: true }),
      {},
    );

    console.info(`WC2::session_proposal id=${id}`, params);
    const url = proposer.metadata.url ?? '';
    const name = proposer.metadata.name ?? '';
    const description = proposer.metadata.description ?? '';
    const { icons = [] } = proposer.metadata;
    try {
      this.wcOptions.subjectMetadataController.addSubjectMetadata({
        subjectType: SubjectType.Website,
        name,
        description,
        origin: url,
        iconUrl: icons[0],
      });
      await this.wcOptions.approvalController.addAndShowApprovalRequest({
        id: `${id}`,
        origin: url,
        requestData: {
          hostname: url,
          permissions,
          metadata: {
            id: `${id}`,
            url,
            name,
            description,
            requiredChainIds,
            origin: url,
            icons,
            analytics: {
              request_source: 'WalletConnectV2',
              request_platform: '', // FIXME use mobile for deeplink or QRCODE
            },
          },
        },
        type: ApprovalType.WalletRequestPermissions,
      });
      // Permissions approved.
    } catch (err) {
      // Failed permissions request - reject session
      await this.web3Wallet.rejectSession({
        id: proposal.id,
        error: getSdkError('USER_REJECTED_METHODS'),
      });
    }
    const supportedChainControllers = Object.values(
      this.wcOptions.chainsController.activeControllers,
    ).filter(
      (controller) =>
        isHexString(controller.chainId) &&
        requiredChainIds.includes(hexToDecimal(controller.chainId)),
    );
    this.web3Wallet
      .approveSession({
        id: proposal.id,
        chainIds: supportedChainControllers.map((c) =>
          Number(hexToDecimal(c.chainId)),
        ),
        // TODO: use native address
        // const { nativeAddress } = chainController.getCurrentAccount();
        accounts: [this.wcOptions.preferencesController.getSelectedAddress()],
      })
      .then((activeSession) => {
        const deeplink =
          this.deeplinkSessions &&
          typeof this.deeplinkSessions[activeSession.pairingTopic] !==
            'undefined';
        const session = new WalletConnect2Session({
          session: activeSession,
          deeplink,
          web3Wallet: this.web3Wallet,
          wcOptions: this.wcOptions,
        });

        this.sessions[activeSession.topic] = session;
        if (deeplink) {
          session.redirect();
        }
      });
  }

  private async onSessionRequest(
    requestEvent: SingleEthereumTypes.SessionRequest,
  ) {
    try {
      const session = this.sessions[requestEvent.topic];

      if (!session) {
        console.warn(`WC2 invalid session topic ${requestEvent.topic}`);
        await this.web3Wallet.rejectRequest({
          topic: requestEvent.topic,
          id: requestEvent.id,
          error: { code: 1, message: ERROR_MESSAGES.INVALID_ID },
        });

        return;
      }

      await session.handleRequest(requestEvent);
    } catch (err) {
      console.error(
        `WC2::onSessionRequest() Error while handling request`,
        err,
      );
    }
  }

  public async connect({
    wcUri,
    redirectUrl,
    origin,
  }: {
    wcUri: string;
    redirectUrl?: string;
    origin: string; // deeplink or qrcode
  }) {
    try {
      console.info(
        `WC2Manager::connect ${wcUri} origin=${origin} redirectUrl=${redirectUrl}`,
      );
      const params = parseWalletConnectUri(wcUri);
      const isDeepLink = origin === DEEPLINKS.ORIGIN_DEEPLINK;

      const rawParams = getAllUrlParams(wcUri);
      // First check if the url continas sessionTopic, meaning it is only here from an existing connection (so we don't need to create pairing)
      if (rawParams.sessionTopic) {
        const { sessionTopic } = rawParams;
        this.sessions[sessionTopic]?.setDeeplink(true);
        return;
      }

      if (params.version === 1) {
        throw new Error('WalletConnect v2 is not supported');
        // await WalletConnect.newSession(wcUri, redirectUrl, false, origin);
      } else if (params.version === 2) {
        // check if already connected
        const activeSession = this.getSessions().find(
          (session) =>
            session.topic === params.topic ||
            session.pairingTopic === params.topic,
        );
        if (activeSession) {
          this.sessions[activeSession.topic]?.setDeeplink(isDeepLink);
          return;
        }

        // cleanup uri before pairing.
        const cleanUri = wcUri.startsWith('wc://')
          ? wcUri.replace('wc://', 'wc:')
          : wcUri;
        const paired = await this.web3Wallet.core.pairing.pair({
          uri: cleanUri,
        });
        if (isDeepLink) {
          this.deeplinkSessions[paired.topic] = {
            redirectUrl,
            origin,
          };
          // keep list of deeplinked origin
          this.wcOptions.storage.setItem(
            WALLET_CONNECT.DEEPLINK_SESSIONS,
            this.deeplinkSessions,
          );
        }
      } else {
        console.warn(`Invalid WalletConnect uri`, wcUri);
      }
    } catch (err) {
      console.error(`Failed to connect uri=${wcUri}`, err);
    }
  }
}

export default WC2Manager;
