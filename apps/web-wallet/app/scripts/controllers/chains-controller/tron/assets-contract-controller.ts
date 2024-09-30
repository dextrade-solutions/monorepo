import {
  BaseConfig,
  BaseControllerV1,
  BaseState,
} from '@metamask/base-controller';

export class AssetsContractController extends BaseControllerV1<
  BaseConfig,
  BaseState
> {
  tronweb: any;

  /**
   * Name of this controller used during composition
   */
  override name = 'AssetsContractController';

  /**
   * Creates a AssetsContractController instance.
   *
   * @param opts
   * @param opts.tronwebClient
   * @param config - Initial options used to configure this controller.
   * @param state - Initial state to set on this controller.
   */
  constructor(
    { tronwebClient }: { tronwebClient: any },
    config?: Partial<BaseConfig>,
    state?: Partial<BaseState>,
  ) {
    super(config, state);
    this.initialize();

    this.tronweb = tronwebClient;
  }

  /**
   * Enumerate assets assigned to an owner.
   *
   * @param tokenAddress - TRC20 asset contract address.
   * @returns Promise resolving to an object containing the token standard and a set of details which depend on which standard the token supports.
   */
  async getTokenStandardAndDetails(tokenAddress: string): Promise<{
    symbol: string;
    decimals: string;
  }> {
    try {
      // Get contract instance
      const contract = await this.tronweb.contract().at(tokenAddress);

      // Call the symbol() function of the contract
      const symbol = await contract.symbol().call();

      // Call the decimals() function of the contract
      const decimals = await contract.decimals().call();

      return { symbol, decimals };
    } catch (error) {
      throw new Error('Unable to determine contract standard');
    }
  }

  /**
   * Get the token balance for a list of token addresses in a single call. Only non-zero balances
   * are returned.
   *
   * @param selectedAddress - The address to check token balances for.
   * @param tokens - The token addresses to detect balances for.
   * @returns The list of non-zero token balances.
   */
  async getBalancesInSingleCall(selectedAddress: string, tokens: string[]) {
    const contractInstances = await Promise.all(
      tokens.map(async (tokenAddress) => {
        return await this.tronweb.contract().at(tokenAddress);
      }),
    );

    // Batch requests for balance of each token
    const batch = this.tronweb.createBatch();
    const balanceRequests = contractInstances.map((contract) => {
      return contract.balanceOf(selectedAddress).call;
    });

    // Execute batch requests
    const balances = await new Promise((resolve, reject) => {
      batch.batchCall(balanceRequests, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    // Map balances to token addresses
    const tokenBalances = tokens.reduce((acc, tokenAddress, index) => {
      acc[tokenAddress] = balances[index];
      return acc;
    }, {});

    return tokenBalances;
  }
}

export default AssetsContractController;
