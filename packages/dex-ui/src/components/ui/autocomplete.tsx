import {
  Autocomplete as MuiAutocomplete,
  AutocompleteProps,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Box,
  Chip,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

interface CustomAutocompleteProps<
  Value,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined,
> extends AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo> {
  paper?: boolean;
}

export default function Autocomplete<
  Value,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined,
>(props: CustomAutocompleteProps<Value, Multiple, DisableClearable, FreeSolo>) {
  const { paper, options, renderOption } = props;
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
  if (paper) {
    const renderList = options?.filter((option) => {
      return getOptionLabel(option)
        .toLowerCase()
        .includes(inputValue.toLowerCase());
    });
    return (
      <Box>
        {props.value ? (
          <Box>
            <Box>
              <Chip
                label={getOptionLabel(props.value)}
                onDelete={
                  options.length > 1 &&
                  (() => props.onChange(undefined, undefined))
                }
              />
            </Box>
            <Box
              sx={{
                borderRadius: 1,
                mt: 2,
                backgroundImage: 'url(/images/testatm1.jpg)', // Fixed line
                minHeight: 200,
                backgroundSize: 'contain',
              }}
            >
              {getOptionLabel(props.value).includes('ATM Krungthai') && (
                <img src="" />
              )}
            </Box>
          </Box>
        ) : (
          <Paper sx={{ my: 2, bgcolor: 'transparent', overflow: 'auto' }}>
            {options.length > 2 && (
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
            )}
            <List>
              {renderList.map((option, index) => (
                <ListItem
                  key={index}
                  onClick={() => props.onChange(undefined, option)}
                >
                  {renderOption ? (
                    renderOption(undefined, option)
                  ) : (
                    <ListItemText primary={getOptionLabel(option)} />
                  )}
                </ListItem>
              ))}
              {!renderList.length && (
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
