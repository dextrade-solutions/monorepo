import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Typography from '../typography/typography';
import {
  TextColor,
  TypographyVariant,
} from '../../../helpers/constants/design-system';
import { DECIMAL_REGEX } from '../../../../shared/constants/tokens';

export default function NumericInput({
  helpText = '',
  value,
  onChange,
  error = '',
  autoFocus = false,
  allowDecimals = true,
  disabled = false,
  dataTestId,
  placeholder,
  id,
  name,
}) {
  return (
    <div
      className={classNames('numeric-input', { 'numeric-input--error': error })}
    >
      <input
        type="number"
        // inputMode="numeric"
        value={value}
        onKeyDown={(e) => {
          if (!allowDecimals && e.key === '.') {
            e.preventDefault();
          }
        }}
        onChange={(e) => {
          const newValue = e.target.value;
          const match = DECIMAL_REGEX.exec(newValue);
          if (match?.[1]?.length >= 15) {
            return;
          }
          onChange?.(parseFloat(newValue, 10));
        }}
        autoFocus={autoFocus}
        disabled={disabled}
        data-testid={dataTestId}
        placeholder={placeholder}
        id={id}
        name={name}
      />
      {helpText && (
        <Typography
          color={TextColor.textAlternative}
          variant={TypographyVariant.H7}
          as="span"
        >
          {helpText}
        </Typography>
      )}
    </div>
  );
}

NumericInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  helpText: PropTypes.string,
  onChange: PropTypes.func,
  error: PropTypes.bool,
  autoFocus: PropTypes.bool,
  allowDecimals: PropTypes.bool,
  disabled: PropTypes.bool,
  dataTestId: PropTypes.string,
  placeholder: PropTypes.string,
  /**
   * The name of the input
   */
  name: PropTypes.string,
  /**
   * The id of the input element. Should be used with htmlFor with a label element.
   */
  id: PropTypes.string,
};
