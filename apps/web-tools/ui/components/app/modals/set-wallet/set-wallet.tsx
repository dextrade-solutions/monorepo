import '../styles.scss';
import {
  Box,
  Typography,
  Button,
  MenuItem,
  MenuList,
  ListItemIcon,
  ListItemText,
  TextField,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import { Wallet, useWallet } from '@solana/wallet-adapter-react';
import { NetworkNames } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { CopyData, UrlIcon, ButtonIcon, PulseLoader } from 'dex-ui';
import { useState } from 'react';

import withModalProps from '../../../../helpers/hoc/with-modal-props';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import AssetItem from '../../../ui/asset-item';
import { ModalProps } from '../types';

const SetWallet = ({
  asset,
  value,
  onChange,
  hideModal,
}: {
  asset: AssetModel;
  value: { address: string; icon: string } | null;
  open: boolean;
  onChange: (v: { address: string; icon: string } | null) => void;
} & ModalProps) => {
  const isSolNetwork = asset.network === NetworkNames.solana;
  const canConnectExternalWallet = isSolNetwork;
  const canPasteAddress = true;

  const t = useI18nContext();
  const { wallets, connecting, select } = useWallet();
  const [inputWalletAddress, setInputWalletAddress] = useState('');

  const onSetInputWallet = () => {
    onChange({ address: inputWalletAddress, icon: '' });
    hideModal();
  };

  const onSelectWallet = async (item: Wallet) => {
    select(item.adapter.name);
    await item.adapter.connect();
    const address = item.adapter.publicKey?.toBase58();
    const { icon } = item.adapter;
    onChange({
      address,
      icon,
    });
    hideModal();
  };
  return (
    <Box padding={5}>
      <Box display="flex" justifyContent="space-between" marginBottom={2}>
        <AssetItem asset={asset} />

        <ButtonIcon
          iconName="close"
          color="secondary"
          size="sm"
          onClick={hideModal}
          ariaLabel={t('close')}
        />
      </Box>

      <Box marginY={1}>
        <Divider />
      </Box>
      {value?.address ? (
        <Box>
          <Typography marginBottom={1}>My wallet address</Typography>
          <Box marginBottom={3}>
            <CopyData data={value.address} />
          </Box>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              onChange(null);
              hideModal();
            }}
          >
            Detach address
          </Button>
        </Box>
      ) : (
        <Box>
          {canConnectExternalWallet && (
            <>
              <Typography variant="h6">Connect wallet</Typography>
              {connecting ? (
                <PulseLoader />
              ) : (
                <MenuList>
                  {wallets.map((item, idx) => (
                    <MenuItem key={idx} onClick={() => onSelectWallet(item)}>
                      <ListItemIcon>
                        <UrlIcon url={item.adapter.icon} fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>{item.adapter.name}</ListItemText>
                      {item.adapter.connected && (
                        <ListItemSecondaryAction>
                          <Typography color="text.secondary">
                            {' '}
                            Connected
                          </Typography>
                        </ListItemSecondaryAction>
                      )}
                    </MenuItem>
                  ))}
                </MenuList>
              )}
            </>
          )}
          {canPasteAddress && canConnectExternalWallet && (
            <Typography color="text.secondary" marginY={3}>
              OR
            </Typography>
          )}
          <Box>
            <Typography marginBottom={1} variant="h6">
              Paste your wallet address
            </Typography>
            <Box>
              <TextField
                placeholder="Recepient address"
                fullWidth
                size="medium"
                onChange={(v) => setInputWalletAddress(v.target.value)}
              />
              {inputWalletAddress && (
                <Box marginTop={1}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={onSetInputWallet}
                  >
                    Attach address
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

const SetWalletComponent = withModalProps(SetWallet);

export default SetWalletComponent;
