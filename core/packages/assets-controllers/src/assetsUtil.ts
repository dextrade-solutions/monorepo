import type { BigNumber } from '@ethersproject/bignumber';
import {
  convertHexToDecimal,
  toChecksumHexAddress,
} from '@metamask/controller-utils';
import type { Hex } from '@metamask/utils';
import { BN, stripHexPrefix } from 'ethereumjs-util';
import { CID } from 'multiformats/cid';

import type {
  Nft,
  NftMetadata,
  OpenSeaV2Collection,
  OpenSeaV2Contract,
  OpenSeaV2DetailedNft,
  OpenSeaV2Nft,
} from './NftController';
import type { ApiNft, ApiNftContract } from './NftDetectionController';
import type { AbstractTokenPricesService } from './token-prices-service';
import { type ContractExchangeRates } from './TokenRatesController';

/**
 * The maximum number of token addresses that should be sent to the Price API in
 * a single request.
 */
export const TOKEN_PRICES_BATCH_SIZE = 30;

/**
 * Compares nft metadata entries to any nft entry.
 * We need this method when comparing a new fetched nft metadata, in case a entry changed to a defined value,
 * there's a need to update the nft in state.
 *
 * @param newNftMetadata - Nft metadata object.
 * @param nft - Nft object to compare with.
 * @returns Whether there are differences.
 */
export function compareNftMetadata(newNftMetadata: NftMetadata, nft: Nft) {
  const keys: (keyof NftMetadata)[] = [
    'image',
    'backgroundColor',
    'imagePreview',
    'imageThumbnail',
    'imageOriginal',
    'animation',
    'animationOriginal',
    'externalLink',
  ];
  const differentValues = keys.reduce((value, key) => {
    if (newNftMetadata[key] && newNftMetadata[key] !== nft[key]) {
      return value + 1;
    }
    return value;
  }, 0);
  return differentValues > 0;
}

const aggregatorNameByKey: Record<string, string> = {
  aave: 'Aave',
  bancor: 'Bancor',
  cmc: 'CMC',
  cryptocom: 'Crypto.com',
  coinGecko: 'CoinGecko',
  oneInch: '1inch',
  paraswap: 'Paraswap',
  pmm: 'PMM',
  zapper: 'Zapper',
  zerion: 'Zerion',
  zeroEx: '0x',
  synthetix: 'Synthetix',
  yearn: 'Yearn',
  apeswap: 'ApeSwap',
  binanceDex: 'BinanceDex',
  pancakeTop100: 'PancakeTop100',
  pancakeExtended: 'PancakeExtended',
  balancer: 'Balancer',
  quickswap: 'QuickSwap',
  matcha: 'Matcha',
  pangolinDex: 'PangolinDex',
  pangolinDexStableCoin: 'PangolinDexStableCoin',
  pangolinDexAvaxBridge: 'PangolinDexAvaxBridge',
  traderJoe: 'TraderJoe',
  airswapLight: 'AirswapLight',
  kleros: 'Kleros',
};

/**
 * Formats aggregator names to presentable format.
 *
 * @param aggregators - List of token list names in camelcase.
 * @returns Formatted aggregator names.
 */
export const formatAggregatorNames = (aggregators: string[]) => {
  return aggregators.map(
    (key) =>
      aggregatorNameByKey[key] ||
      `${key[0].toUpperCase()}${key.substring(1, key.length)}`,
  );
};

/**
 * Format token list assets to use image proxy from Codefi.
 *
 * @param params - Object that contains chainID and tokenAddress.
 * @param params.chainId - ChainID of network in 0x-prefixed hexadecimal format.
 * @param params.tokenAddress - Address of token in mixed or lowercase.
 * @returns Formatted image url
 */
export const formatIconUrlWithProxy = ({
  chainId,
  tokenAddress,
}: {
  chainId: Hex;
  tokenAddress: string;
}) => {
  const chainIdDecimal = convertHexToDecimal(chainId).toString();
  return `https://static.metafi.codefi.network/api/v1/tokenIcons/${chainIdDecimal}/${tokenAddress.toLowerCase()}.png`;
};

/**
 * Networks where token detection is supported - Values are in decimal format
 */
export enum SupportedTokenDetectionNetworks {
  mainnet = '0x1', // decimal: 1
  bsc = '0x38', // decimal: 56
  polygon = '0x89', // decimal: 137
  avax = '0xa86a', // decimal: 43114
  aurora = '0x4e454152', // decimal: 1313161554
  linea_goerli = '0xe704', // decimal: 59140
  linea_mainnet = '0xe708', // decimal: 59144
  arbitrum = '0xa4b1', // decimal: 42161
  optimism = '0xa', // decimal: 10
  base = '0x2105', // decimal: 8453
  zksync = '0x144', // decimal: 324
}

/**
 * Check if token detection is enabled for certain networks.
 *
 * @param chainId - ChainID of network
 * @returns Whether the current network supports token detection
 */
export function isTokenDetectionSupportedForNetwork(chainId: Hex): boolean {
  return Object.values<Hex>(SupportedTokenDetectionNetworks).includes(chainId);
}

/**
 * Check if token list polling is enabled for a given network.
 * Currently this method is used to support e2e testing for consumers of this package.
 *
 * @param chainId - ChainID of network
 * @returns Whether the current network supports tokenlists
 */
export function isTokenListSupportedForNetwork(chainId: Hex): boolean {
  return isTokenDetectionSupportedForNetwork(chainId);
}

/**
 * Removes IPFS protocol prefix from input string.
 *
 * @param ipfsUrl - An IPFS url (e.g. ipfs://{content id})
 * @returns IPFS content identifier and (possibly) path in a string
 * @throws Will throw if the url passed is not IPFS.
 */
export function removeIpfsProtocolPrefix(ipfsUrl: string) {
  if (ipfsUrl.startsWith('ipfs://ipfs/')) {
    return ipfsUrl.replace('ipfs://ipfs/', '');
  } else if (ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl.replace('ipfs://', '');
  }
  // this method should not be used with non-ipfs urls (i.e. startsWith('ipfs://') === true)
  throw new Error('this method should not be used with non ipfs urls');
}

/**
 * Extracts content identifier and path from an input string.
 *
 * @param ipfsUrl - An IPFS URL minus the IPFS protocol prefix
 * @returns IFPS content identifier (cid) and sub path as string.
 * @throws Will throw if the url passed is not ipfs.
 */
export function getIpfsCIDv1AndPath(ipfsUrl: string): {
  cid: string;
  path?: string;
} {
  const url = removeIpfsProtocolPrefix(ipfsUrl);

  // check if there is a path
  // (CID is everything preceding first forward slash, path is everything after)
  const index = url.indexOf('/');
  const cid = index !== -1 ? url.substring(0, index) : url;
  const path = index !== -1 ? url.substring(index) : undefined;

  // We want to ensure that the CID is v1 (https://docs.ipfs.io/concepts/content-addressing/#identifier-formats)
  // because most cid v0s appear to be incompatible with IPFS subdomains
  return {
    cid: CID.parse(cid).toV1().toString(),
    path,
  };
}

/**
 * Formats URL correctly for use retrieving assets hosted on IPFS.
 *
 * @param ipfsGateway - The users preferred IPFS gateway (full URL or just host).
 * @param ipfsUrl - The IFPS URL pointed at the asset.
 * @param subdomainSupported - Boolean indicating whether the URL should be formatted with subdomains or not.
 * @returns A formatted URL, with the user's preferred IPFS gateway and format (subdomain or not), pointing to an asset hosted on IPFS.
 */
export function getFormattedIpfsUrl(
  ipfsGateway: string,
  ipfsUrl: string,
  subdomainSupported: boolean,
): string {
  const { host, protocol, origin } = new URL(addUrlProtocolPrefix(ipfsGateway));
  if (subdomainSupported) {
    const { cid, path } = getIpfsCIDv1AndPath(ipfsUrl);
    return `${protocol}//${cid}.ipfs.${host}${path ?? ''}`;
  }
  const cidAndPath = removeIpfsProtocolPrefix(ipfsUrl);
  return `${origin}/ipfs/${cidAndPath}`;
}

/**
 * Adds URL protocol prefix to input URL string if missing.
 *
 * @param urlString - An IPFS URL.
 * @returns A URL with a https:// prepended.
 */
export function addUrlProtocolPrefix(urlString: string): string {
  if (!urlString.match(/(^http:\/\/)|(^https:\/\/)/u)) {
    return `https://${urlString}`;
  }
  return urlString;
}

/**
 * Converts an Ethers BigNumber to a BN.
 *
 * @param bigNumber - An Ethers BigNumber instance.
 * @returns A BN object.
 */
export function ethersBigNumberToBN(bigNumber: BigNumber): BN {
  return new BN(stripHexPrefix(bigNumber.toHexString()), 'hex');
}

/**
 * Partitions a list of values into groups that are at most `batchSize` in
 * length.
 *
 * @param values - The list of values.
 * @param args - The remaining arguments.
 * @param args.batchSize - The desired maximum number of values per batch.
 * @returns The list of batches.
 */
export function divideIntoBatches<Value>(
  values: Value[],
  { batchSize }: { batchSize: number },
): Value[][] {
  const batches = [];
  for (let i = 0; i < values.length; i += batchSize) {
    batches.push(values.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * Constructs an object from processing batches of the given values
 * sequentially.
 *
 * @param args - The arguments to this function.
 * @param args.values - A list of values to iterate over.
 * @param args.batchSize - The maximum number of values in each batch.
 * @param args.eachBatch - A function to call for each batch. This function is
 * similar to the function that `Array.prototype.reduce` takes, in that it
 * receives the object that is being built, each batch in the list of batches
 * and the index, and should return an updated version of the object.
 * @param args.initialResult - The initial value of the final data structure,
 * i.e., the value that will be fed into the first call of `eachBatch`.
 * @returns The built object.
 */
export async function reduceInBatchesSerially<
  Value,
  Result extends Record<PropertyKey, unknown>,
>({
  values,
  batchSize,
  eachBatch,
  initialResult,
}: {
  values: Value[];
  batchSize: number;
  eachBatch: (
    workingResult: Partial<Result>,
    batch: Value[],
    index: number,
  ) => Partial<Result> | Promise<Partial<Result>>;
  initialResult: Partial<Result>;
}): Promise<Result> {
  const batches = divideIntoBatches(values, { batchSize });
  let workingResult = initialResult;
  for (const [index, batch] of batches.entries()) {
    workingResult = await eachBatch(workingResult, batch, index);
  }
  // There's no way around this — we have to assume that in the end, the result
  // matches the intended type.
  const finalResult = workingResult as Result;
  return finalResult;
}

/**
 * Maps an OpenSea V2 NFT to the V1 schema.
 * @param nft - The V2 NFT to map.
 * @returns The NFT in the V1 schema.
 */
export function mapOpenSeaNftV2ToV1(nft: OpenSeaV2Nft): ApiNft {
  return {
    token_id: nft.identifier,
    num_sales: null,
    background_color: null,
    image_url: nft.image_url ?? null,
    image_preview_url: null,
    image_thumbnail_url: null,
    image_original_url: null,
    animation_url: null,
    animation_original_url: null,
    name: nft.name,
    description: nft.description,
    external_link: null,
    asset_contract: {
      address: nft.contract,
      asset_contract_type: null,
      created_date: null,
      schema_name: nft.token_standard.toUpperCase(),
      symbol: null,
      total_supply: null,
      description: nft.description,
      external_link: null,
      collection: {
        name: nft.collection,
        image_url: null,
      },
    },
    creator: {
      user: { username: '' },
      profile_img_url: '',
      address: '',
    },
    last_sale: null,
  };
}

/**
 * Maps an OpenSea V2 detailed NFT to the V1 schema.
 * @param nft - The V2 detailed NFT to map.
 * @returns The NFT in the V1 schema.
 */
export function mapOpenSeaDetailedNftV2ToV1(nft: OpenSeaV2DetailedNft): ApiNft {
  const mapped = mapOpenSeaNftV2ToV1(nft);
  return {
    ...mapped,
    animation_url: nft.animation_url ?? null,
    creator: {
      ...mapped.creator,
      address: nft.creator,
    },
  };
}

/**
 * Maps an OpenSea V2 contract to the V1 schema.
 * @param contract - The v2 contract data.
 * @param collection - The v2 collection data.
 * @returns The contract in the v1 schema.
 */
export function mapOpenSeaContractV2ToV1(
  contract: OpenSeaV2Contract,
  collection?: OpenSeaV2Collection,
): ApiNftContract {
  return {
    address: contract.address,
    asset_contract_type: null,
    created_date: null,
    schema_name: contract.contract_standard.toUpperCase(),
    symbol: null,
    total_supply:
      collection?.total_supply?.toString() ??
      contract.total_supply?.toString() ??
      null,
    description: collection?.description ?? null,
    external_link: collection?.project_url ?? null,
    collection: {
      name: collection?.name ?? contract.name,
      image_url: collection?.image_url,
    },
  };
}

/**
 * Retrieves token prices for a set of contract addresses in a specific currency and chainId.
 *
 * @param args - The arguments to function.
 * @param args.tokenPricesService - An object in charge of retrieving token prices.
 * @param args.nativeCurrency - The native currency to request price in.
 * @param args.tokenAddresses - The list of contract addresses.
 * @param args.chainId - The chainId of the tokens.
 * @returns The prices for the requested tokens.
 */
export async function fetchTokenContractExchangeRates({
  tokenPricesService,
  nativeCurrency,
  tokenAddresses,
  chainId,
}: {
  tokenPricesService: AbstractTokenPricesService;
  nativeCurrency: string;
  tokenAddresses: Hex[];
  chainId: Hex;
}): Promise<ContractExchangeRates> {
  const isChainIdSupported =
    tokenPricesService.validateChainIdSupported(chainId);
  const isCurrencySupported =
    tokenPricesService.validateCurrencySupported(nativeCurrency);

  if (!isChainIdSupported || !isCurrencySupported) {
    return {};
  }

  const tokenPricesByTokenAddress = await reduceInBatchesSerially<
    Hex,
    Awaited<ReturnType<AbstractTokenPricesService['fetchTokenPrices']>>
  >({
    values: [...tokenAddresses].sort(),
    batchSize: TOKEN_PRICES_BATCH_SIZE,
    eachBatch: async (allTokenPricesByTokenAddress, batch) => {
      const tokenPricesByTokenAddressForBatch =
        await tokenPricesService.fetchTokenPrices({
          tokenAddresses: batch,
          chainId,
          currency: nativeCurrency,
        });

      return {
        ...allTokenPricesByTokenAddress,
        ...tokenPricesByTokenAddressForBatch,
      };
    },
    initialResult: {},
  });

  return Object.entries(tokenPricesByTokenAddress).reduce(
    (obj, [tokenAddress, tokenPrice]) => {
      return {
        ...obj,
        [toChecksumHexAddress(tokenAddress)]: tokenPrice?.value,
      };
    },
    {},
  );
}
