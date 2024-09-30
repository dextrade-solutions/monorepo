import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

import {
  EXCHANGER_AD_EDIT_ROUTE,
  EXCHANGER_SETTINGS_ROUTE,
} from '../../../helpers/constants/routes';
import { Menu, MenuItem } from '../../../components/ui/menu';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { ICON_NAMES } from '../../../components/component-library';

export default function AccountOptionsMenu({ anchorElement, onClose }) {
  const t = useI18nContext();
  const history = useHistory();

  const isRemovable = false;
  return (
    <Menu
      anchorElement={anchorElement}
      className="account-options-menu"
      onHide={onClose}
    >
      <MenuItem
        onClick={() => {
          history.push(EXCHANGER_AD_EDIT_ROUTE);
          onClose();
        }}
        iconName={ICON_NAMES.ADD}
      >
        New exchange
      </MenuItem>
      <MenuItem
        onClick={() => {
          history.push(EXCHANGER_SETTINGS_ROUTE);
          onClose();
        }}
        iconName={ICON_NAMES.SETTING_DEX}
      >
        Settings
      </MenuItem>
      {isRemovable ? (
        <MenuItem
          onClick={() => {
            onClose();
          }}
          iconName={ICON_NAMES.TRASH}
        >
          {t('removeAccount')}
        </MenuItem>
      ) : null}
    </Menu>
  );
}

AccountOptionsMenu.propTypes = {
  anchorElement: PropTypes.instanceOf(window.Element),
  onClose: PropTypes.func.isRequired,
};

AccountOptionsMenu.defaultProps = {
  anchorElement: undefined,
};
