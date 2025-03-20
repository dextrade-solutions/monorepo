import {
  Autocomplete,
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import { getCurrentTheme, setTheme } from '../../ducks/app/app';
import { getCurrentLocale } from '../../ducks/locale/locale';
import { ISO_LANGS } from '../../helpers/utils/i18n-helper';
import { useI18nContext } from '../../hooks/useI18nContext';
import { updateCurrentLocale } from '../../store/actions';
import { AppDispatch } from '../../store/store';

export default function GeneralSettings() {
  const t = useI18nContext();
  const dispatch = useDispatch<AppDispatch>();
  const currentLocale = useSelector(getCurrentLocale);
  const currentTheme = useSelector(getCurrentTheme);
  const supportedLocales = ['en', 'ru', 'zh-CN'];
  const themes = [
    { value: 'system', text: t('system') },
    { value: 'dark', text: t('dark') },
    { value: 'light', text: t('light') },
  ];

  const setCurrentLocale = async (key: string) => {
    dispatch(updateCurrentLocale(key));
  };

  return (
    <Box>
      <Autocomplete
        value={currentLocale}
        onChange={(_, v) => setCurrentLocale(v)}
        options={supportedLocales}
        fullWidth
        disableClearable
        getOptionLabel={(v) => ISO_LANGS[v]}
        renderInput={(props) => <TextField label={t('language')} {...props} />}
      />

      <Typography marginTop={2} fontWeight="bold">
        {t('theme')}
      </Typography>
      <FormControl>
        <RadioGroup
          value={currentTheme}
          onChange={(v) => {
            dispatch(setTheme(v.target.value));
          }}
        >
          {themes.map((item, idx) => (
            <Box key={idx}>
              <FormControlLabel
                value={item.value}
                control={<Radio color="primary" />}
                label={item.text}
              />
            </Box>
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  );
}
