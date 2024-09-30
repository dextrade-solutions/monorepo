import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Box from '../box';
import {
  AVATAR_ICON_SIZES,
  AvatarIcon,
  ButtonLink,
  ICON_NAMES,
  Input,
  Text,
} from '../../component-library';
import {
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import Image from '../image';

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

export default function FileField({
  label,
  value,
  placeholderIconName = ICON_NAMES.USER,
  base64,
  loading,
  dextradeAvatarHash,
  avatar,
  onChange,
  boxProps,
}) {
  const hiddenFileInput = useRef(null);

  const handleClick = () => {
    hiddenFileInput.current.click();
  };
  // Call a function (passed as a prop from the parent component)
  // to handle the user-selected file
  const handleChange = async (event) => {
    const fileUploaded = event.target.files[0];
    if (fileUploaded) {
      let file = fileUploaded;

      if (base64) {
        file = await toBase64(fileUploaded);
        // remove base64 prefix from string
        file = file.split(',').pop();
      }
      onChange(file);
    }
  };

  return (
    <>
      {label && (
        <Text marginBottom={2} variant={TextVariant.bodyMdBold} marginRight={3}>
          {label}
        </Text>
      )}
      <Box {...boxProps} className="file-field">
        {avatar && (
          <AvatarIcon
            size={AVATAR_ICON_SIZES.XL}
            iconName={placeholderIconName}
            marginRight={3}
            src={value}
            dextradeAvatarHash={dextradeAvatarHash}
          />
        )}
        <Box>
          <ButtonLink
            className="file-field__btn"
            onClick={handleClick}
            disabled={loading}
          >
            {value && !loading && base64 ? (
              <Image src={value} />
            ) : (
              'Upload file'
            )}
            {loading && 'Uploading...'}
          </ButtonLink>
          <Input
            type="file"
            accept="image/*"
            required
            label="Document"
            name="originalFileName"
            onChange={handleChange}
            size="small"
            ref={hiddenFileInput}
            style={{ display: 'none' }}
          />

          {base64 && (
            <Text color={TextColor.textMuted} marginTop={2}>
              (JPG/JPEG/PNG/BMP, 5MB)
            </Text>
          )}
        </Box>
      </Box>
    </>
  );
}

FileField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  placeholderIconName: PropTypes.string,
  base64: PropTypes.bool,
  loading: PropTypes.bool,
  avatar: PropTypes.bool,
  dextradeAvatarHash: PropTypes.string,
  onChange: PropTypes.func,
  boxProps: PropTypes.shape({
    ...Box.propTypes,
  }),
};
