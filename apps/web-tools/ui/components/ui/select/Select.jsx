import { Box, Select as MuiSelect, TextField, Typography } from '@mui/material';
import classnames from 'classnames';
import Fuse from 'fuse.js';
import PropTypes from 'prop-types';
import React, { useCallback, useState, useMemo, useRef } from 'react';

import SelectItem from './SelectItem';

const Select = ({
  onChange,
  options = [],
  renderLabel,
  value,
  defaultValue,
  className,
  itemText,
  disabled,
  autocomplete = false,
  limit = 6,
  ...rest
}) => {
  const searchField = useRef();
  const [search, setSearch] = useState('');
  const fuse = useMemo(
    () =>
      new Fuse(options, {
        location: 0,
        keys: itemText ? [itemText] : [],
      }),
    [options, itemText],
  );

  const filteredOptions = useMemo(() => {
    const list = search
      ? fuse
          .search(search, { limit })
          .map((v) => (typeof v === 'object' ? v : options[v]))
      : options.slice(0, limit).map((i, idx) => ({ item: i, refIndex: idx }));

    return list.sort(
      (p, n) => Number(n.selected || false) - Number(p.selected || false),
    );
  }, [fuse, options, search, limit]);

  const handleChange = useCallback(
    (e) => {
      if (!e) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const val = e.target.value;
      onChange && onChange(val);
    },
    [onChange],
  );

  const handleSearch = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  const renderOption = (item) => {
    if (renderLabel) {
      return renderLabel(value, item);
    }

    return itemText ? item[itemText] : item;
  };
  return (
    <div className={classnames('select', className)}>
      <MuiSelect
        onChange={handleChange}
        value={value}
        defaultValue={defaultValue}
        variant="outlined"
        disabled={disabled}
        renderValue={() => <Box>{itemText ? value[itemText] : value}</Box>}
        onClose={() => setSearch('')}
        {...rest}
      >
        {autocomplete && (
          <Box
            className="select__input"
            onKeyDown={(e) => e.stopPropagation()}
            padding={2}
          >
            <TextField
              ref={searchField}
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search..."
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          </Box>
        )}
        {filteredOptions.map(({ item, refIndex }) => (
          <SelectItem
            key={refIndex}
            value={item}
            onKeyDown={() => searchField?.current?.focus()}
          >
            {renderOption(item)}
          </SelectItem>
        ))}
        {filteredOptions.length === 0 && (
          <Typography padding={3}>No results...</Typography>
        )}
      </MuiSelect>
    </div>
  );
};

Select.propTypes = {
  /**
   * Additional css className to add to root of Dropdown component
   */
  className: PropTypes.string,
  /**
   * On options change handler
   */
  onChange: PropTypes.func,
  /**
   * Predefined options for component
   */
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ).isRequired,
  /**
   * Selected value
   */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  /**
   * Default value
   */
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  /**
   * Render label callback
   */
  renderLabel: PropTypes.func,
  /**
   * Key of object label
   */
  itemText: PropTypes.string,
  /**
   * Key of object value
   */
  itemValue: PropTypes.string,
  autocomplete: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default Select;
