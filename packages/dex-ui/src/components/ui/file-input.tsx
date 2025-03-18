import { styled } from '@mui/material/styles';
import { CloudUploadIcon } from 'lucide-react';
import Button from './button';
import { useState, ChangeEvent } from 'react';
import { Box, Typography } from '@mui/material';
import { Icon } from '.';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface InputFileUploadProps {
  onChange?: (files: FileList | null) => void;
  multiple?: boolean;
  accept?: string;
  label?: string;
  maxSize?: number; // in MB
}

export default function InputFileUpload({
  onChange,
  multiple = false,
  accept,
  label = 'Upload files',
  maxSize = 5,
}: InputFileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = event.target.files;
    if (!files) {
      setSelectedFiles(null);
      onChange?.(null);
      return;
    }

    let validFiles = true;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File ${file.name} exceeds the maximum size of ${maxSize}MB.`);
        validFiles = false;
        break;
      }
    }

    if (validFiles) {
      setSelectedFiles(files);
      onChange?.(files);
    } else {
      setSelectedFiles(null);
      onChange?.(null);
    }
  };

  const handleClear = () => {
    setSelectedFiles(null);
    setError(null);
    onChange?.(null);
  };

  return (
    <Box>
      <Button
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        startIcon={<CloudUploadIcon />}
        sx={{ width: 'fit-content' }}
      >
        {label}
        <VisuallyHiddenInput
          type="file"
          onChange={handleFileChange}
          multiple={multiple}
          accept={accept}
        />
      </Button>
      {selectedFiles && selectedFiles.length > 0 && (
        <Box mt={1}>
          <Typography variant="body2" gutterBottom>
            Selected files:
          </Typography>
          <ul>
            {Array.from(selectedFiles).map((file, index) => (
              <li key={index}>
                <Box display="flex" alignItems="center">
                  <Typography variant="body2">{file.name}</Typography>
                  <Icon
                    name="close"
                    size="sm"
                    ml={1}
                    onClick={handleClear}
                    sx={{ cursor: 'pointer' }}
                  />
                </Box>
              </li>
            ))}
          </ul>
        </Box>
      )}
      {error && (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}
    </Box>
  );
}
