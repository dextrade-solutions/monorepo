import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import { generateMnemonic } from 'bip39';
import { GradientButton } from 'dex-ui';
import { Copy } from 'lucide-react';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

interface SeedPhraseFormProps {
  value?: string[];
  onChange: (value: string[]) => void;
}

export const SeedPhraseForm: React.FC<SeedPhraseFormProps> = ({
  value,
  onChange: setSeedPhrase,
}) => {
  const [numWords, setNumWords] = useState(12); // Default to 12
  const seedPhrase = value || Array(numWords).fill('');
  const { enqueueSnackbar } = useSnackbar();

  const handleNumWordsChange = (event: SelectChangeEvent) => {
    const newNumWords = parseInt(event.target.value as string, 10);
    setNumWords(newNumWords);
    setSeedPhrase(Array(newNumWords).fill(''));
  };

  const generateSeedPhrase = () => {
    const mnemonic = generateMnemonic((numWords * 32) / 3);
    const words = mnemonic.split(' ');
    setSeedPhrase(words);
  };

  const handleSeedPhraseChange = (index: number, newValue: string) => {
    const newSeedPhrase = [...seedPhrase];
    newSeedPhrase[index] = newValue;
    setSeedPhrase(newSeedPhrase);
  };
  const handleCopy = () => {
    enqueueSnackbar('Seed phrase copied to clipboard!', { variant: 'success' });
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData('text');
    const words = pastedText.trim().split(/\s+/); // Split by any whitespace

    if (words.length !== numWords) {
      enqueueSnackbar(
        `Incorrect number of words. Please paste ${numWords} words.`,
        { variant: 'error' },
      );
      return; // Don't update the seed phrase if the number of words is wrong
    }

    setSeedPhrase(words);
  };

  return (
    <Box data-testid="seed-phrase-form">
      <FormControl
        sx={{ mb: 2 }}
        fullWidth
        margin="normal"
        data-testid="seed-phrase-num-words-select"
      >
        {/* Added data-testid */}
        <InputLabel id="num-words-label">Number of Words</InputLabel>
        <Select
          labelId="num-words-label"
          id="num-words"
          value={numWords.toString()}
          label="Number of Words"
          onChange={handleNumWordsChange}
        >
          <MenuItem value="12">12</MenuItem>
          <MenuItem value="18">18</MenuItem>
          <MenuItem value="24">24</MenuItem>
        </Select>
      </FormControl>

      <Box
        sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}
      >
        {seedPhrase.map((word, index) => (
          <TextField
            key={index}
            label={`Word ${index + 1}`}
            value={word}
            onChange={(e) => handleSeedPhraseChange(index, e.target.value)}
            onPaste={handlePaste}
            data-testid={`seed-phrase-word-input-${index + 1}`} // Added data-testid
          />
        ))}
      </Box>
      <Box display="flex" mt={2} gap={3}>
        <CopyToClipboard text={seedPhrase.join(' ')} onCopy={handleCopy}>
          <Button
            variant="outlined"
            endIcon={<Copy size={16} />}
            fullWidth
            data-testid="seed-phrase-copy-button" // Added data-testid
          >
            Copy
          </Button>
        </CopyToClipboard>

        <Button
          onClick={generateSeedPhrase}
          fullWidth
          variant="outlined"
          data-testid="seed-phrase-generate-button" // Added data-testid
        >
          Generate
        </Button>
      </Box>
    </Box>
  );
};
