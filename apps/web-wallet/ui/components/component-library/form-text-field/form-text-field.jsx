import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import {
  DISPLAY,
  FLEX_DIRECTION,
  SEVERITIES,
  Size,
} from '../../../helpers/constants/design-system';

import Box from '../../ui/box/box';

import { TextField } from '../text-field';
import { HelpText } from '../help-text';
import { Label } from '../label';
import TextArea from '../../ui/textarea/textarea';

export const FormTextField = ({
  autoComplete,
  autoFocus,
  className,
  defaultValue,
  disabled,
  error,
  helpText,
  helpTextProps,
  id,
  inputProps,
  inputRef,
  label,
  labelProps,
  startAccessory,
  maxLength,
  name,
  onBlur,
  onChange,
  onFocus,
  placeholder,
  readOnly,
  required,
  endAccessory,
  size = Size.LG,
  textFieldProps,
  truncate,
  type = 'text',
  value,
  textarea,
  ...props
}) => {
  const WrappedInput = textarea ? TextArea : TextField;
  return (
    <Box
      className={classnames(
        'mm-form-text-field',
        { 'mm-form-text-field--disabled': disabled },
        className,
      )}
      display={DISPLAY.FLEX}
      flexDirection={FLEX_DIRECTION.COLUMN}
      {...props}
    >
      {label && (
        <Label
          htmlFor={id}
          {...labelProps}
          className={classnames(
            'mm-form-text-field__label',
            labelProps?.className,
          )}
        >
          {label}
        </Label>
      )}
      <WrappedInput
        className={classnames(
          'mm-form-text-field__text-field',
          textFieldProps?.className,
        )}
        id={id}
        {...{
          autoComplete,
          autoFocus,
          defaultValue,
          disabled,
          error,
          id,
          inputProps,
          inputRef,
          startAccessory,
          maxLength,
          name,
          onBlur,
          onChange,
          onFocus,
          placeholder,
          readOnly,
          required,
          endAccessory,
          size,
          truncate,
          type,
          value,
          ...textFieldProps,
        }}
      />
      {helpText && (
        <HelpText
          severity={error && SEVERITIES.DANGER}
          marginTop={1}
          {...helpTextProps}
          className={classnames(
            'mm-form-text-field__help-text',
            helpTextProps?.className,
          )}
        >
          {helpText}
        </HelpText>
      )}
    </Box>
  );
};

FormTextField.propTypes = {
  /**
   * An additional className to apply to the form-text-field
   */
  className: PropTypes.string,
  /**
   * The id of the FormTextField
   * Required if label prop exists to ensure accessibility
   *
   * @param {object} props - The props passed to the component.
   * @param {string} propName - The prop name in this case 'id'.
   * @param {string} componentName - The name of the component.
   */
  id: (props, propName, componentName) => {
    if (props.label && !props[propName]) {
      return new Error(
        `If a label prop exists you must provide an ${propName} prop for the label's htmlFor attribute for accessibility. Warning coming from ${componentName} ui/components/component-library/form-text-field/form-text-field.js`,
      );
    }
    return null;
  },
  /**
   * The content of the Label component
   */
  label: PropTypes.string,
  /**
   * Props that are applied to the Label component
   */
  labelProps: PropTypes.object,
  /**
   * The content of the HelpText component
   */
  helpText: PropTypes.string,
  /**
   * Props that are applied to the HelpText component
   */
  helpTextProps: PropTypes.object,
  /**
   * Props that are applied to the TextField component
   */
  textFieldProps: PropTypes.object,
  /**
   * FormTextField accepts all the props from TextField and Box
   */
  textarea: PropTypes.bool,
  ...TextField.propTypes,
};
