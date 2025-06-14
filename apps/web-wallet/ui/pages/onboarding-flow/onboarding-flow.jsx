import React, { useEffect, useState, useContext } from 'react';
import { Switch, Route, useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Unlock from '../unlock-page';
import {
  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  ONBOARDING_EXPERIMENTAL_AREA,
  ///: END:ONLY_INCLUDE_IN
  ONBOARDING_CREATE_PASSWORD_ROUTE,
  ONBOARDING_REVIEW_SRP_ROUTE,
  ONBOARDING_CONFIRM_SRP_ROUTE,
  ONBOARDING_UNLOCK_ROUTE,
  ONBOARDING_WELCOME_ROUTE,
  DEFAULT_ROUTE,
  ONBOARDING_SECURE_YOUR_WALLET_ROUTE,
  ONBOARDING_PRIVACY_SETTINGS_ROUTE,
  ONBOARDING_COMPLETION_ROUTE,
  ONBOARDING_IMPORT_WITH_SRP_ROUTE,
  ONBOARDING_PIN_EXTENSION_ROUTE,
  ONBOARDING_METAMETRICS,
} from '../../helpers/constants/routes';
import { getCompletedOnboarding } from '../../ducks/metamask/metamask';
import {
  createNewVaultAndGetSeedPhrase,
  unlockAndGetSeedPhrase,
  createNewVaultAndRestore,
  verifySeedPhrase,
} from '../../store/actions';
import { getFirstTimeFlowTypeRoute } from '../../selectors';
import { MetaMetricsContext } from '../../contexts/metametrics';
import Button from '../../components/ui/button';
import { useI18nContext } from '../../hooks/useI18nContext';
import { EVENT_NAMES, EVENT } from '../../../shared/constants/metametrics';
///: BEGIN:ONLY_INCLUDE_IN(flask)
// import ExperimentalArea from '../../components/app/flask/experimental-area';
///: END:ONLY_INCLUDE_IN
import OnboardingFlowSwitch from './onboarding-flow-switch/onboarding-flow-switch';
import CreatePassword from './create-password/create-password';
import ReviewRecoveryPhrase from './recovery-phrase/review-recovery-phrase';
import SecureYourWallet from './secure-your-wallet/secure-your-wallet';
import ConfirmRecoveryPhrase from './recovery-phrase/confirm-recovery-phrase';
import PrivacySettings from './privacy-settings/privacy-settings';
import CreationSuccessful from './creation-successful/creation-successful';
import OnboardingWelcome from './welcome/welcome';
import ImportSRP from './import-srp/import-srp';
import OnboardingPinExtension from './pin-extension/pin-extension';
import MetaMetricsComponent from './metametrics/metametrics';

const TWITTER_URL = 'https://twitter.com/MetaMask';

export default function OnboardingFlow() {
  const [secretRecoveryPhrase, setSecretRecoveryPhrase] = useState('');
  const dispatch = useDispatch();
  const { pathName, search } = useLocation();
  const history = useHistory();
  const t = useI18nContext();
  const completedOnboarding = useSelector(getCompletedOnboarding);
  const nextRoute = useSelector(getFirstTimeFlowTypeRoute);
  const isFromReminder = new URLSearchParams(search).get('isFromReminder');
  const trackEvent = useContext(MetaMetricsContext);

  useEffect(() => {
    if (completedOnboarding && !isFromReminder) {
      history.push(DEFAULT_ROUTE);
    }
  }, [history, completedOnboarding, isFromReminder]);

  useEffect(() => {
    const verifyAndSetSeedPhrase = async () => {
      if (completedOnboarding && !secretRecoveryPhrase) {
        const verifiedSeedPhrase = await verifySeedPhrase();
        if (verifiedSeedPhrase) {
          setSecretRecoveryPhrase(verifiedSeedPhrase);
        }
      }
    };
    verifyAndSetSeedPhrase();
  }, [completedOnboarding, secretRecoveryPhrase]);

  const handleCreateNewAccount = async (password) => {
    const newSecretRecoveryPhrase = await dispatch(
      createNewVaultAndGetSeedPhrase(password),
    );
    setSecretRecoveryPhrase(newSecretRecoveryPhrase);
  };

  const handleUnlock = async (password) => {
    const retrievedSecretRecoveryPhrase = await dispatch(
      unlockAndGetSeedPhrase(password),
    );
    setSecretRecoveryPhrase(retrievedSecretRecoveryPhrase);
    history.push(nextRoute);
  };

  const handleImportWithRecoveryPhrase = async (password, srp) => {
    return await dispatch(createNewVaultAndRestore(password, srp));
  };

  return (
    <div className="onboarding-flow">
      <div className="onboarding-flow__wrapper">
        <Switch>
          <Route
            path={ONBOARDING_CREATE_PASSWORD_ROUTE}
            render={(routeProps) => (
              <CreatePassword
                {...routeProps}
                createNewAccount={handleCreateNewAccount}
                importWithRecoveryPhrase={handleImportWithRecoveryPhrase}
                secretRecoveryPhrase={secretRecoveryPhrase}
              />
            )}
          />
          <Route
            path={ONBOARDING_SECURE_YOUR_WALLET_ROUTE}
            component={SecureYourWallet}
          />
          <Route
            path={ONBOARDING_REVIEW_SRP_ROUTE}
            render={() => (
              <ReviewRecoveryPhrase
                secretRecoveryPhrase={secretRecoveryPhrase}
              />
            )}
          />
          <Route
            path={ONBOARDING_CONFIRM_SRP_ROUTE}
            render={() => (
              <ConfirmRecoveryPhrase
                secretRecoveryPhrase={secretRecoveryPhrase}
              />
            )}
          />
          <Route
            path={ONBOARDING_IMPORT_WITH_SRP_ROUTE}
            render={(routeProps) => (
              <ImportSRP
                {...routeProps}
                submitSecretRecoveryPhrase={setSecretRecoveryPhrase}
              />
            )}
          />
          <Route
            path={ONBOARDING_UNLOCK_ROUTE}
            render={(routeProps) => (
              <Unlock {...routeProps} onSubmit={handleUnlock} />
            )}
          />
          <Route
            path={ONBOARDING_PRIVACY_SETTINGS_ROUTE}
            component={PrivacySettings}
          />
          <Route
            path={ONBOARDING_COMPLETION_ROUTE}
            component={CreationSuccessful}
          />
          <Route
            path={ONBOARDING_WELCOME_ROUTE}
            component={OnboardingWelcome}
          />
          <Route
            path={ONBOARDING_PIN_EXTENSION_ROUTE}
            component={OnboardingPinExtension}
          />
          <Route
            path={ONBOARDING_METAMETRICS}
            component={MetaMetricsComponent}
          />
          {
            ///: BEGIN:ONLY_INCLUDE_IN(flask)
          }
          {/* <Route
            path={ONBOARDING_EXPERIMENTAL_AREA}
            render={(routeProps) => (
              <ExperimentalArea
                {...routeProps}
                redirectTo={ONBOARDING_WELCOME_ROUTE}
              />
            )}
          /> */}
          {
            ///: END:ONLY_INCLUDE_IN
          }
          <Route exact path="*" component={OnboardingFlowSwitch} />
        </Switch>
      </div>
      {pathName === ONBOARDING_COMPLETION_ROUTE && (
        <Button
          className="onboarding-flow__twitter-button"
          type="link"
          href={TWITTER_URL}
          onClick={() => {
            trackEvent({
              category: EVENT.CATEGORIES.ONBOARDING,
              event: EVENT_NAMES.ONBOARDING_TWITTER_CLICK,
              properties: {
                text: t('followUsOnTwitter'),
                location: EVENT_NAMES.ONBOARDING_WALLET_CREATION_COMPLETE,
                url: TWITTER_URL,
              },
            });
          }}
          target="_blank"
        >
          <span>{t('followUsOnTwitter')}</span>
          <i className="fab fa-twitter onboarding-flow__twitter-button__icon" />
        </Button>
      )}
    </div>
  );
}
