import BaseChainController from '../interface';

import BlockcypherService from '../../../services/blockcypher-service';
import GetblockService from '../../../services/getblock-service';
import BlockstreamService from '../../../services/blockstream-service';
import BlockchainInfoService from '../../../services/blockchaininfo-service';
import { BlockChainInfoTx } from './types';

export default interface BitcoinController extends BaseChainController {
  blockchainInfoService: BlockchainInfoService;
  blockstreamService: BlockstreamService;
  getblockService: GetblockService;
  blockcypherService: BlockcypherService;
  txsInfo: BlockChainInfoTx[];
  txsAddress: string[];
}
