import PropTypes from 'prop-types';
import { Component, createContext, useMemo } from 'react';
import { useSelector } from 'react-redux';

import {
  getCurrentLocale,
  getCurrentLocaleMessages,
} from '../ducks/locale/locale';
import { getMessage } from '../helpers/utils/i18n-helper';

export const I18nContext = createContext((key: string) => `[${key}]`);

export const I18nProvider = (props: any) => {
  const currentLocale = useSelector(getCurrentLocale);
  const current = useSelector(getCurrentLocaleMessages);

  const t = useMemo(() => {
    return (key, ...args) => getMessage(currentLocale, current, key, ...args);
  }, [currentLocale, current]);

  return (
    <I18nContext.Provider value={t}>{props.children}</I18nContext.Provider>
  );
};

I18nProvider.propTypes = {
  children: PropTypes.node,
};

I18nProvider.defaultProps = {
  children: undefined,
};

export class LegacyI18nProvider extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  static defaultProps = {
    children: undefined,
  };

  static contextType = I18nContext;

  static childContextTypes = {
    t: PropTypes.func,
  };

  getChildContext() {
    return {
      t: this.context,
    };
  }

  render() {
    return this.props.children;
  }
}
