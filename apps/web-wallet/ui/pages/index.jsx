import * as Sentry from '@sentry/browser';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DexUiProvider } from 'dex-ui';
import PropTypes from 'prop-types';
import React, { PureComponent, useContext } from 'react';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';

import ErrorPage from './error';
import Routes from './routes';
import ToastContainer from './toast';
import {
  I18nContext,
  I18nProvider,
  LegacyI18nProvider,
} from '../contexts/i18n';
import {
  MetaMetricsProvider,
  LegacyMetaMetricsProvider,
} from '../contexts/metametrics';

const queryClient = new QueryClient();

const DexUiWrappedProvider = ({ children }) => {
  const t = useContext(I18nContext);
  return <DexUiProvider t={t} theme="light" children={children} />;
};

class Index extends PureComponent {
  state = {};

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    Sentry.captureException(error);
  }

  render() {
    const { error, errorId } = this.state;
    const { store } = this.props;

    if (error) {
      return (
        <Provider store={store}>
          <I18nProvider>
            <LegacyI18nProvider>
              <ErrorPage error={error} errorId={errorId} />
            </LegacyI18nProvider>
          </I18nProvider>
        </Provider>
      );
    }

    return (
      <Provider store={store}>
        <HashRouter hashType="noslash">
          <MetaMetricsProvider>
            <LegacyMetaMetricsProvider>
              <I18nProvider>
                <LegacyI18nProvider>
                  <DexUiWrappedProvider>
                    <ToastContainer>
                      <QueryClientProvider client={queryClient}>
                        <Routes />
                      </QueryClientProvider>
                    </ToastContainer>
                  </DexUiWrappedProvider>
                </LegacyI18nProvider>
              </I18nProvider>
            </LegacyMetaMetricsProvider>
          </MetaMetricsProvider>
        </HashRouter>
      </Provider>
    );
  }
}

Index.propTypes = {
  store: PropTypes.object,
};

export default Index;
