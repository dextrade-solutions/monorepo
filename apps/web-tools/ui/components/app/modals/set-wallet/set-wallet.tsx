import '../styles.scss';
import {
  Modal,
  Box,
  Typography,
  Button,
  Menu,
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
import { useEffect, useState } from 'react';

import { useI18nContext } from '../../../../hooks/useI18nContext';
import AssetItem from '../../../ui/asset-item';
import { ButtonIcon } from '../../../ui/button-icon';
import PulseLoader from '../../../ui/pulse-loader';
import UrlIcon from '../../../ui/url-icon';

export const SetWallet = ({
  asset,
  value,
  open,
  onChange,
  onClose,
}: {
  asset: AssetModel;
  value: { address: string; icon: string } | null;
  open: boolean;
  onChange: (v: { address: string; icon: string } | null) => void;
  onClose: () => void;
}) => {
  const t = useI18nContext();
  const { wallets, select } = useWallet();
  // const wallets = [];
  const [inputWalletAddress, setInputWalletAddress] = useState('');

  const { connected, connecting, wallet, disconnect } = useWallet();

  const onDisconnectWallet = () => {
    disconnect();
    onChange(null);
    onClose();
  };

  const onSetInputWallet = () => {
    onChange({ address: inputWalletAddress, icon: '' });
    onClose();
  };

  const onSelectWallet = (item: Wallet) => {
    if (item.adapter.connected) {
      onDisconnectWallet();
    } else {
      select(item.adapter.name);
    }
  };
  useEffect(() => {
    if (connected) {
      onChange({
        address: wallet?.adapter.publicKey?.toBase58(),
        icon: wallet?.adapter.icon,
      });
      onClose();
    }
  }, [connected]);

  const canConnectExternalWallet = asset.network === NetworkNames.solana;
  const canPasteAddress = true;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{ bgcolor: 'background.default' }}
        className="modal-generic"
        padding={5}
      >
        <Box display="flex" justifyContent="space-between" marginBottom={2}>
          <AssetItem asset={asset} />

          <ButtonIcon
            iconName="close"
            color="secondary"
            size="sm"
            onClick={onClose}
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
              <Button>{value?.address}</Button>
            </Box>
            <Button variant="outlined" fullWidth onClick={() => onChange(null)}>
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
                    {wallets.map((item) => (
                      <MenuItem onClick={() => onSelectWallet(item)}>
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
                Paste your own address
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
    </Modal>
  );
};
