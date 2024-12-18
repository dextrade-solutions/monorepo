import { Alert } from '@mui/material';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { AuthData } from '../../app/types/auth';
import { API_BASE_URL } from '../../helpers/constants/app';
import DextradeService from '../../services/dextrade';
import { HOME_ROUTE } from '../helpers/constants/routes';

export default function AuthPage() {
  const [_, setAuth] = useLocalStorage<AuthData | null>('auth', null);
  const [query] = useSearchParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const apikey = query.get('apikey');
  const apiversion = query.get('apiversion') || '';
  const lang = query.get('lang');
  const theme = query.get('theme');

  const isValidApiversion = Object.values(API_BASE_URL).find(
    (v) => v.toLowerCase() === apiversion.toLowerCase(),
  );

  useEffect(() => {
    if (apikey && lang && isValidApiversion) {
      setAuth({
        apikey,
        apiversion,
        lang,
        theme,
      });
      i18n.changeLanguage(lang);
      DextradeService.axios.defaults.baseURL = apiversion;
      navigate(HOME_ROUTE);
    }
  }, [
    navigate,
    setAuth,
    i18n,
    apikey,
    lang,
    theme,
    apiversion,
    isValidApiversion,
  ]);

  return <Alert severity="error">Auth error</Alert>;
}
