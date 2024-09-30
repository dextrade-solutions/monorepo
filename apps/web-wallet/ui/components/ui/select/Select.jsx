import React, { useCallback, useState, useMemo, useRef } from 'react';
import { Select as MuiSelect } from '@material-ui/core';
import Fuse from 'fuse.js';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import TextField from '../text-field';
import Box from '../box';
import { Text } from '../../component-library';
import SelectItem from './SelectItem';

const Select = ({
  onChange,
  options = [],
  renderLabel,
  value,
  defaultValue,
  className,
  itemText,
  itemValue,
  autocomplete = false,
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
  const filteredOptions = useMemo(
    () =>
      search
        ? fuse
            .search(search)
            .map((v) => (typeof v === 'object' ? v : options[v]))
        : options,
    [search, fuse, options],
  );

  const handleChange = useCallback(
    (e) => {
      if (!e) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const val = e.target.value;
      onChange &&
        onChange(itemValue ? options.find((i) => i[itemValue] === val) : val);
    },
    [onChange, options, itemValue],
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
        value={itemValue ? value && value[itemValue] : value}
        defaultValue={defaultValue}
        variant="outlined"
        onClose={() => setSearch('')}
        {...rest}
      >
        {autocomplete && (
          <Box className="select__input" onKeyDown={(e) => e.stopPropagation()}>
            <TextField
              ref={searchField}
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search..."
              autoFocus
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          </Box>
        )}
        {filteredOptions.map((item, idx) => (
          <SelectItem
            key={idx}
            value={itemValue ? item[itemValue] : item}
            onKeyDown={() => searchField?.current?.focus()}
          >
            {renderOption(item)}
          </SelectItem>
        ))}
        {filteredOptions.length === 0 && <Text padding={3}>No results...</Text>}
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
};

export default Select;
