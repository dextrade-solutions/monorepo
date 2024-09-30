import { InputAdornment, TextField } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

// import { Icon, ICON_NAMES } from '../../../components/component-library';
// import TextField from '../../../components/ui/text-field';
// import { IconColor, Size } from '../../../helpers/constants/design-system';

const StartIcon = () => (
  <div className="select-coins__search__input__adornment">
    <InputAdornment position="start">
      {/* <Icon name={ICON_NAMES.SEARCH} color={IconColor.iconAlternative} /> */}
    </InputAdornment>
  </div>
);

const EndIcon = ({ onClick }) => {
  const handleClick = useCallback(
    (e) => {
      e && e.preventDefault();
      e && e.stopPropagation();
      e && e.nativeEvent?.stopImmediatePropagation();
      onClick && onClick(e);
    },
    [onClick],
  );
  return (
    <div
      className="select-coins__search__input__adornment"
      onClick={handleClick}
    >
      <InputAdornment position="end">
        {/* <Icon
          name={ICON_NAMES.CLOSE}
          color={IconColor.iconAlternative}
          size={Size.SM}
        /> */}
      </InputAdornment>
    </div>
  );
};

export const SelectCoinsItemSearch = ({
  value,
  placeholder,
  onChange,
  error,
}) => {
  const handleChange = useCallback(
    ({ target }) => {
      onChange(target.value);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <div className="select-coins__search">
      <TextField
        className="select-coins__search__input"
        placeholder={placeholder}
        type="text"
        value={value}
        onChange={handleChange}
        error={error}
        fullWidth
        // startAdornment={<StartIcon />}
        // endAdornment={value && <EndIcon onClick={handleClear} />}
        autoComplete="off"
      />
    </div>
  );
};

SelectCoinsItemSearch.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  error: PropTypes.string,
};
