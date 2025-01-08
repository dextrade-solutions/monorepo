import { BUILT_IN_NETWORKS, SECOND } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { useSelector } from 'react-redux';
import {
  useConnectors,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from 'wagmi';

import { ERC20 } from '../../../app/constants/abi';
import { getAssetAccount } from '../../ducks/app/app';

export default function useAllowance(asset: AssetModel) {
  const assetAccount = useSelector((state) => getAssetAccount(state, asset));

  const { writeContract } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const connectors = useConnectors();

  const tokenApproval = useReadContract({
    abi: ERC20,
    chainId: asset.chainId,
    address: asset.contract,
    functionName: 'allowance',
    args: [
      assetAccount?.address,
      BUILT_IN_NETWORKS[asset.network]?.atomicSwapContract,
    ],
    query: {
      refetchInterval: 5 * SECOND,
    },
  });

  const approveSpendAmount = async (
    toSpendAmount: bigint,
    txSentHandlers: {
      onSuccess: (txHash: string) => void;
      onError: (e: unknown) => void;
    },
  ) => {
    const connectedWallet = assetAccount?.walletName;
    const connector = connectors.find((i) => i.name === connectedWallet);

    if (!connector) {
      throw new Error('No connector found');
    }

    const isConnected = await connector.isAuthorized();
    if (!isConnected) {
      await connector?.connect();
    }
    const approveTx = async () => {
      writeContract(
        {
          connector,
          abi: ERC20,
          chainId: asset.chainId,
          address: asset.contract,
          functionName: 'approve',
          args: [
            BUILT_IN_NETWORKS[asset.network].atomicSwapContract,
            toSpendAmount,
          ],
        },
        txSentHandlers,
      );
    };
    return switchChain(
      { connector, chainId: asset.chainId },
      {
        onSuccess: approveTx,
        onError: (e) => {
          console.error(e);
          // try execute makeTransaction without switching
          approveTx();
        },
      },
    );
  };

  return { approveSpendAmount, tokenApproval };
}
