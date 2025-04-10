import {
  Autocomplete as MuiAutocomplete,
  AutocompleteProps,
  TextField,
  ListItemButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  Box,
  Divider,
  Chip,
} from '@mui/material';
import React, { useState, useMemo } from 'react';

interface CustomAutocompleteProps<
  Value,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined,
> extends AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo> {
  paper?: boolean;
  disableSearch?: boolean;
}

export default function Autocomplete<
  Value,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined,
>(props: CustomAutocompleteProps<Value, Multiple, DisableClearable, FreeSolo>) {
  const {
    paper,
    options,
    multiple,
    renderOption,
    value,
    onChange,
    disableSearch,
  } = props;
  const [inputValue, setInputValue] = useState('');

  const getOptionLabel = (option: any) => {
    if (props.getOptionLabel) {
      return props.getOptionLabel(option);
    }
    if (typeof option === 'string') {
      return option;
    }
    return JSON.stringify(option);
  };

  const renderList = useMemo(() => {
    if (!options) {
      return [];
    }
    return options
      .filter((option) => {
        const label = getOptionLabel(option).toLowerCase();
        return label.includes(inputValue.toLowerCase());
      })
      .filter((option) => {
        if (multiple && Array.isArray(value)) {
          return !value.some(
            (v) => getOptionLabel(v) === getOptionLabel(option),
          );
        }
        return true;
      });
  }, [options, inputValue, multiple, value, getOptionLabel]);

  if (paper) {
    return (
      <Box>
        {value && (
          <Box>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {multiple ? (
                (Array.isArray(value) ? value : [value]).map((v, index) => (
                  <Chip
                    key={index}
                    label={
                      renderOption
                        ? renderOption(undefined, v, { selected: true })
                        : getOptionLabel(v)
                    }
                    onDelete={() => {
                      const newValue = (
                        Array.isArray(value) ? value : [value]
                      ).filter((_, i) => i !== index);
                      onChange(true, newValue.length ? newValue : undefined);
                    }}
                  />
                ))
              ) : (
                <Chip
                  label={getOptionLabel(value)}
                  onDelete={
                    options.length > 1 && (() => onChange(undefined, undefined))
                  }
                />
              )}
            </Box>
          </Box>
        )}
        {(!value || multiple) && (
          <Paper elevation={0} sx={{ overflow: 'auto' }}>
            {!disableSearch && (
              <>
                <TextField
                  sx={{
                    p: 2,
                  }}
                  InputProps={{
                    disableUnderline: true,
                  }}
                  fullWidth
                  variant="standard"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder="Search..."
                />
                <Divider />
              </>
            )}
            <List>
              {renderList.map((option, index) => (
                <ListItemButton
                  key={index}
                  sx={{ my: 1 }}
                  className="bordered"
                  onClick={() => {
                    if (multiple) {
                      const newValue = Array.isArray(value)
                        ? [...value, option]
                        : [option];
                      onChange(undefined, newValue);
                    } else {
                      onChange(undefined, option);
                    }
                  }}
                >
                  {renderOption ? (
                    renderOption(undefined, option, {
                      selected: Array.isArray(value)
                        ? value.some(
                            (v) => getOptionLabel(v) === getOptionLabel(option),
                          )
                        : getOptionLabel(value) === getOptionLabel(option),
                    })
                  ) : (
                    <ListItemText primary={getOptionLabel(option)} />
                  )}
                </ListItemButton>
              ))}
              {!renderList.length && inputValue && (
                <ListItem>
                  <ListItemText secondary="Not found..." />
                </ListItem>
              )}
            </List>
          </Paper>
        )}
      </Box>
    );
  }

  return <MuiAutocomplete {...props} />;
}
