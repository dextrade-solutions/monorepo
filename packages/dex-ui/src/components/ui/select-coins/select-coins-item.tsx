import { Box, CircularProgress, Typography } from '@mui/material';
import classnames from 'classnames';
import { formatCurrency, getCoinIconByUid } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types'; // Assuming AssetModel is defined here or in a similar location
import { ChevronDown } from 'lucide-react';
import React, { memo, useState, useRef, useEffect } from 'react';

import { useGlobalModalContext } from '../../app/modals';
import UrlIcon from '../url-icon';

interface SelectCoinsItemProps {
  value: AssetModel | null;
  items: AssetModel[];
  onChange: (newAsset: AssetModel | null) => void;
  reversed?: boolean;
  className?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  maxListItem?: number;
  loading?: boolean;
  fuseSearchKeys?: any; // You might want to define a more specific type for this
  shouldSearchForImports?: boolean;
  sx?: any;
}

export const SelectCoinsItem = memo<SelectCoinsItemProps>(
  ({
    value,
    onChange,
    reversed,
    className,
    placeholder,
    searchPlaceholder,
    items = [],
    loading = false,
    maxListItem,
    fuseSearchKeys,
    sx,
    shouldSearchForImports,
  }) => {
    const t = (v) => v;
    const { showModal } = useGlobalModalContext();
    const inputRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
      if (open) {
        // While you used focus method in the original code, it's not applicable for div element.
        // You might want to change inputRef to input if you'll put input into this component.
        // inputRef.current?.focus();
      }
    }, [open]);

    const onToggle = () => {
      if (!loading) {
        showModal({
          name: 'ASSET_SELECT',
          value,
          items,
          onChange,
          loading,
          fuseSearchKeys,
          maxListItem,
          shouldSearchForImports,
          searchPlaceholder,
        });
      }
    };

    const disabledProps = {
      color: 'text.secondary',
      cursor: 'default',
    };

    return (
      <Box
        className={classnames('select-coins__item', className, {
          'select-coins__item--loading': loading, // Add loading class
        })}
        sx={{
          ...(loading ? disabledProps : {}),
          ...(sx || {}),
        }}
        tabIndex={0}
        data-testid="select-coin"
        onClick={onToggle}
      >
        <div
          className={classnames('select-coins__item__label', {
            'select-coins__item__label-reversed': reversed,
          })}
        >
          {value && (
            <UrlIcon
              url={getCoinIconByUid(value.uid)}
              className="select-coins__item__label__icon"
              name={value.name} // Assuming value has a 'name' property
            />
          )}
          {value ? (
            <div className="select-coins__item__label__title">
              <Typography
                fontWeight="bold"
                className="select-coins__item__label__title__symbol"
              >
                {value.symbol}
              </Typography>
              {value.standard && (
                <Typography
                  variant="caption"
                  fontWeight="light"
                  className="select-coins__item__label__title__type"
                >
                  {value.standard?.toUpperCase()}
                </Typography>
              )}
              {value.balanceUsdt && (
                <Typography fontWeight="light" color="text.secondary">
                  {`(${formatCurrency(value.balanceUsdt, 'usd')})`}
                </Typography>
              )}
            </div>
          ) : (
            <div className="select-coins__item__label__title__placeholder">
              {placeholder}
            </div>
          )}
          <ChevronDown />
        </div>
      </Box>
    );
  },
);
