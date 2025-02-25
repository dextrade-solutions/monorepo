import {
  Box,
  Button,
  InputAdornment,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
} from '@mui/material';
import { BUILT_IN_NETWORKS, NetworkNames, getCoinIconByUid } from 'dex-helpers';
import { Icon, UrlIcon } from 'dex-ui';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

const EndIcon = ({ value, onClick, onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const stopPropagation = (e) => {
    e && e.preventDefault();
    e && e.stopPropagation();
    e && e.nativeEvent?.stopImmediatePropagation();
  };

  const handleClick = useCallback(
    (e) => {
      stopPropagation(e);
      setAnchorEl(e.currentTarget);
    },
    [onClick],
  );
  const handleClose = (e) => {
    stopPropagation(e);
    setAnchorEl(null);
  };

  const handleChange = (e, v) => {
    handleClose(e);
    onChange(v);
  };

  const valuesList = Object.values(BUILT_IN_NETWORKS);

  return (
    <InputAdornment position="end">
      <Button onClick={handleClick}>
        <Box display="flex" alignItems="center">
          {value && (
            <Box marginRight={1}>
              <UrlIcon url={getCoinIconByUid(value.uid)} />
            </Box>
          )}
          <Icon name="chevron-down" color="text.secondary" size="sm" />
        </Box>
      </Button>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              maxHeight: 600,

              overflow: 'scroll',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={(e) => handleChange(e, null)}>All networks</MenuItem>
        <MenuItem
          onClick={(e) =>
            handleChange(e, {
              key: NetworkNames.fiat,
              uid: 'fiat',
            })
          }
        >
          Fiat
        </MenuItem>
        {valuesList.map((item) => (
          <MenuItem key={item.key} onClick={(e) => handleChange(e, item)}>
            <ListItemAvatar>
              <UrlIcon size={40} url={getCoinIconByUid(item.uid)} />
            </ListItemAvatar>
            <ListItemText>{item.name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </InputAdornment>
  );
};

export const SelectCoinsItemSearch = ({
  inputRef,
  value,
  network,
  placeholder,
  onChange,
  onChangeNetwork,
  error,
}) => {
  const handleChange = useCallback(
    ({ target }) => {
      onChange(target.value);
    },
    [onChange],
  );

  return (
    <div className="select-coins__search">
      <TextField
        inputRef={inputRef}
        data-testid="select-coins-input"
        className="select-coins__search__input"
        placeholder={placeholder}
        type="text"
        value={value}
        onChange={handleChange}
        error={error}
        fullWidth
        InputProps={{
          endAdornment: <EndIcon value={network} onChange={onChangeNetwork} />,
        }}
        autoComplete="off"
      />
    </div>
  );
};

SelectCoinsItemSearch.propTypes = {
  inputRef: PropTypes.any,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  error: PropTypes.string,
};
