import { Fade } from '@material-ui/core';
import classnames from 'classnames';
import React, { useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getCoinIconByUid } from '../../../../../shared/constants/tokens';
import { AssetType } from '../../../../../shared/constants/transaction';
import { getBalances } from '../../../../ducks/metamask/metamask';
import { startNewMultisignTransactions } from '../../../../ducks/send';
import { INVALID_ASSET_TYPE } from '../../../../helpers/constants/error-keys';
import { MULTISIG_ROUTE } from '../../../../helpers/constants/routes';
import { showModal } from '../../../../store/actions';
import Identicon from '../../../ui/identicon/identicon.container';
import ListItem from '../../../ui/list-item';
import { multisigPropTypes } from '../types';
import { MultisigListItemActions } from './MultisigListItemActions';
import { MultisigListItemHeading } from './MultisigListItemHeading';
import { MultisigListItemScript } from './MultisigListItemScript';

const IMAGE_UID_BY_CHAIN = {
  bitcoin: 'bitcoin',
  bitcoin_testnet: 'bitcoin',
  '0x61': 'binancecoin',
  '0x5': 'ethereum',
};

export const MultisigListItem = ({ multisig }) => {
  const {
    id = 'Error read multisign ID',
    totalSigners,
    pubkeys = [],
    account,
    provider,
  } = multisig;

  const dispatch = useDispatch();
  const history = useHistory();

  const tokens = useSelector((state) => getBalances(state, { multisig: true }));

  const userTokens = useSelector(getBalances);

  const token = useMemo(() => {
    const currToken = tokens.find(
      (t) => t?.multisig?.account === account || t?.multisig?.id === id,
    );
    return (
      currToken || {
        provider,
        uid: IMAGE_UID_BY_CHAIN[provider.chainId],
        balance: '0',
        multisig,
      }
    );
  }, [tokens, id, provider, multisig, account]);

  const subDetails = useMemo(
    () =>
      userTokens.find(
        (ust) =>
          ust.provider?.contract === token.provider?.contract &&
          ust.provider?.chainId === token.provider?.chainId,
      ),
    [token, userTokens],
  );

  const symbol = useMemo(() => token?.symbol || 'BTC', [token]);

  const inProcess = useMemo(
    () => pubkeys.length < totalSigners || !account,
    [account, totalSigners, pubkeys],
  );

  const details = useMemo(() => {
    if (!token) {
      return {};
    }
    return {
      provider: token.multisig?.provider || token.provider || {},
      // balance: token.balance,
      balance: 10 ** token.decimals,
      account,
      decimals: token.decimals,
      symbol: token.symbol,
      image: getCoinIconByUid(token.uid),
      network: token.network,
    };
  }, [token, account]);

  const handleMultisigShow = useCallback(
    (e) => {
      e && e.preventDefault();
      e && e.stopPropagation();
      history.push(`${MULTISIG_ROUTE}/${id}`);
    },
    [history, id],
  );

  const handleModalShow = useCallback(
    (e) => {
      e && e.preventDefault();
      e && e.stopPropagation();
      if (inProcess) {
        return handleMultisigShow(e);
      }
      return dispatch(
        showModal({
          name: 'MULTISIG_ACCOUNT_DETAILS',
          token: {
            ...details,
            ...token,
            name: `Multisign ${symbol}`,
            account,
          },
          id,
        }),
      );
    },
    [
      handleMultisigShow,
      details,
      symbol,
      account,
      dispatch,
      token,
      id,
      inProcess,
    ],
  );

  const handleSend = useCallback(
    async (e) => {
      e && e.preventDefault();
      e && e.stopPropagation();
      if (inProcess) {
        return;
      }

      try {
        await dispatch(
          startNewMultisignTransactions({
            type: token.provider.contract ? AssetType.token : AssetType.native,
            isMultisign: true,
            details,
            subDetails,
            id,
          }),
        );
        history.push(`${MULTISIG_ROUTE}/${id}/send`);
      } catch (err) {
        if (!err.message.includes(INVALID_ASSET_TYPE)) {
          throw err;
        }
      }
    },
    [id, inProcess, dispatch, details, history, token, subDetails],
  );

  return (
    <Fade in appear={false} timeout={1500} disableStrictModeCompat>
      <ListItem
        className={classnames('multisig-list__item', { process: inProcess })}
        onClick={handleMultisigShow}
        icon={
          <Identicon
            diameter={32}
            address={account}
            image={getCoinIconByUid(
              IMAGE_UID_BY_CHAIN[provider.chainId] || 'bitcoin',
            )}
          />
        }
        title={!inProcess && <MultisigListItemHeading token={token} />}
        rightContent={
          <MultisigListItemScript multisig={multisig} inProcess={inProcess} />
        }
        secondary
      >
        <MultisigListItemActions
          onModal={handleModalShow}
          onSend={handleSend}
          inProcess={inProcess}
          balance={token?.balance}
        />
      </ListItem>
    </Fade>
  );
};

MultisigListItem.propTypes = {
  multisig: multisigPropTypes,
};
