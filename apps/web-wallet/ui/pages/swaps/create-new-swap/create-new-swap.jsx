import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import Box from '../../../components/ui/box';
import { I18nContext } from '../../../contexts/i18n';
import { navigateBackToBuildQuote } from '../../../ducks/swaps/swaps';
import { DEFAULT_ROUTE } from '../../../helpers/constants/routes';

export default function CreateNewSwap({ onSubmit }) {
  const t = useContext(I18nContext);
  const dispatch = useDispatch();
  const history = useHistory();

  return (
    <Box marginBottom={3} className="create-new-swap">
      <button
        onClick={async () => {
          if (onSubmit) {
            onSubmit();
            return;
          }
          history.push(DEFAULT_ROUTE); // It cleans up Swaps state.
          await dispatch(navigateBackToBuildQuote(history));
        }}
      >
        {t('makeAnotherSwap')}
      </button>
    </Box>
  );
}

CreateNewSwap.propTypes = {
  onSubmit: PropTypes.func,
};
