import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from '@mui/material';
import { useRef } from 'react';

import { KycUploadFile } from '../../../../app/types/dextrade';

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

export function DocInfoFileUploader({
  value,
  onChange,
  label,
  loading,
}: {
  value: KycUploadFile | null;
  onChange: (v: KycUploadFile) => void;
  label: string;
  loading?: boolean;
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
      onChange({
        fileName: fileUploaded.name,
        base64: file,
        contentType: fileUploaded.type,
      });
    }
  };
  return (
    <Box sx={{ flex: 1 }}>
      <input
        type="file"
        accept="image/*"
        required
        name="originalFileName"
        onChange={handleChange}
        ref={hiddenFileInput}
        style={{ display: 'none' }}
      />
      <Card sx={{ backgroundColor: 'transparent' }} onClick={handleClick}>
        <CardActionArea>
          <CardContent>
            {value?.base64 && (
              <Box
                marginBottom={1}
                style={{
                  borderWidth: 0,
                  border: 'none',
                  display: 'block',
                  width: '100%',
                  minHeight: '200px',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  cursor: 'pointer',
                  backgroundImage: `url(data:image/png;base64,${value.base64})`,
                }}
              />
            )}
            <Typography variant={'body2'}>{label}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
}
