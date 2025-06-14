import React from 'react';
import PropTypes from 'prop-types';

import classnames from 'classnames';

import { TextareaAutosize } from '@mui/material';
import {
  RESIZE,
  BorderStyle,
  BLOCK_SIZES,
  Size,
  BorderColor,
  BackgroundColor,
} from '../../../helpers/constants/design-system';

import Box from '../box';

const TextArea = ({
  className,
  value,
  onChange,
  resize = RESIZE.BOTH,
  scrollable = false,
  rowsMax,
  rowsMin,
  boxProps,
  ...props
}) => {
  const textAreaClassnames = classnames(
    'textarea',
    className,
    `textarea--resize-${resize}`,
    {
      'textarea--scrollable': scrollable,
      'textarea--not-scrollable': !scrollable,
    },
  );
  return (
    <Box
      backgroundColor={BackgroundColor.backgroundDefault}
      borderColor={BorderColor.borderDefault}
      borderRadius={Size.SM}
      borderStyle={BorderStyle.solid}
      padding={4}
      width={BLOCK_SIZES.FULL}
      {...boxProps}
    >
      {(boxClassName) => (
        <TextareaAutosize
          rowsMax={rowsMax}
          rowsMin={rowsMin}
          required
          className={classnames(boxClassName, textAreaClassnames)}
          {...{ value, onChange, ...props }}
        />
      )}
    </Box>
  );
};

TextArea.propTypes = {
  /**
   * Optional additional className to add to the Textarea component
   */
  className: PropTypes.string,
  /**
   * Value is the text of the TextArea component
   */
  value: PropTypes.string,
  /**
   * The onChange function of the textarea
   */
  onChange: PropTypes.func,
  /**
   * Resize is the resize capability of the textarea accepts all valid css values
   * Defaults to "both"
   */
  resize: PropTypes.oneOf(Object.values(RESIZE)),
  /**
   * Whether the Textarea should be scrollable. Applies overflow-y: scroll to the textarea
   * Defaults to false
   */
  scrollable: PropTypes.bool,
  /**
   * The Textarea component accepts all Box component props inside the boxProps object
   */
  boxProps: PropTypes.shape({
    ...Box.propTypes,
  }),
  rowsMax: PropTypes.number,
  rowsMin: PropTypes.number,
};

export default TextArea;
