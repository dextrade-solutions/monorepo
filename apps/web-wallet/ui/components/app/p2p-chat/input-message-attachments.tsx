import { useRef } from 'react';
import { ButtonIcon } from '../../component-library';
import Box from '../../ui/box';
import { IconColor } from '../../../helpers/constants/design-system';

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

export function InputMessageAttachments({
  onChange,
  loading,
}: {
  onChange: (v: string) => void;
  loading: boolean;
}) {
  const hiddenFileInput = useRef(null);

  const handleClick = () => {
    if (!hiddenFileInput.current) {
      throw new Error('no hidden file input');
    }
    hiddenFileInput.current.click();
  };
  // Call a function (passed as a prop from the parent component)
  // to handle the user-selected file
  const handleChange = async (event: any) => {
    const fileUploaded = event.target.files[0];
    if (fileUploaded) {
      let file = fileUploaded;
      file = await toBase64(fileUploaded);
      // remove base64 prefix from string
      file = file.split(',').pop();
      onChange(file);
    }
  };
  return (
    <Box>
      <input
        type="file"
        accept="image/*"
        required
        name="originalFileName"
        onChange={handleChange}
        ref={hiddenFileInput}
        style={{ display: 'none' }}
      />
      <ButtonIcon
        disabled={loading}
        color={IconColor.iconAlternative}
        iconName="attachment"
        onClick={handleClick}
      />
    </Box>
  );
}
