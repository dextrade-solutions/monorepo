import React from 'react';
import PropTypes from 'prop-types';
import { FormTextField } from '../../component-library';
import { Size } from '../../../helpers/constants/design-system';

export default function CardNumberInput({ value, onChange, ...args }) {
  const handleOnChange = (e) => {
    // Remove any non-digit characters
    const cleanedInput = e.target.value.replace(/\D/g, '');

    // Define the desired format for a 16-digit card number
    const format = '#### #### #### ####';

    let formattedNumber = '';
    let currentIndex = 0;

    // Iterate over the format and insert digits and separators accordingly
    for (let i = 0; i < format.length; i++) {
      if (format[i] === '#') {
        formattedNumber += cleanedInput[currentIndex] || '';
        currentIndex += 1;
      } else {
        formattedNumber += ' ';
      }
    }
    onChange(e, formattedNumber.trimEnd());
  };
  return (
    <FormTextField
      {...args}
      value={value}
      placeholder="**** **** **** ****"
      required
      size={Size.LG}
      onChange={handleOnChange}
    />
  );
}

CardNumberInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  args: PropTypes.object,
};
