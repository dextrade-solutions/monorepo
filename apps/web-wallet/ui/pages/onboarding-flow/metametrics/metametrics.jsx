import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Typography from '../../../components/ui/typography/typography';
import {
  TypographyVariant,
  FONT_WEIGHT,
  TEXT_ALIGN,
  TextColor,
  IconColor,
} from '../../../helpers/constants/design-system';
import Button from '../../../components/ui/button';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { setParticipateInMetaMetrics } from '../../../store/actions';
import {
  getFirstTimeFlowTypeRoute,
  getFirstTimeFlowType,
} from '../../../selectors';

import { EVENT, EVENT_NAMES } from '../../../../shared/constants/metametrics';

import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  Icon,
  ICON_NAMES,
  ICON_SIZES,
} from '../../../components/component-library';

import Box from '../../../components/ui/box/box';

export default function OnboardingMetametrics() {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const history = useHistory();

  const nextRoute = useSelector(getFirstTimeFlowTypeRoute);
  const firstTimeFlowType = useSelector(getFirstTimeFlowType);

  const trackEvent = useContext(MetaMetricsContext);

  const onConfirm = async () => {
    const [, metaMetricsId] = await dispatch(setParticipateInMetaMetrics(true));
    try {
      trackEvent(
        {
          category: EVENT.CATEGORIES.ONBOARDING,
          event: EVENT_NAMES.WALLET_SETUP_STARTED,
          properties: {
            account_type:
              firstTimeFlowType === 'create'
                ? EVENT.ACCOUNT_TYPES.DEFAULT
                : EVENT.ACCOUNT_TYPES.IMPORTED,
          },
        },
        {
          isOptIn: true,
          metaMetricsId,
          flushImmediately: true,
        },
      );
    } finally {
      history.push(nextRoute);
    }
  };

  const onCancel = async () => {
    await dispatch(setParticipateInMetaMetrics(false));
    history.push(nextRoute);
  };

  return (
    <div
      className="onboarding-metametrics"
      data-testid="onboarding-metametrics"
    >
      <Typography
        variant={TypographyVariant.H2}
        align={TEXT_ALIGN.CENTER}
        fontWeight={FONT_WEIGHT.BOLD}
      >
        {t('onboardingMetametricsTitle')}
      </Typography>
      <Typography
        className="onboarding-metametrics__desc"
        align={TEXT_ALIGN.CENTER}
      >
        {t('onboardingMetametricsDescription')}
      </Typography>
      <Typography
        className="onboarding-metametrics__desc"
        align={TEXT_ALIGN.CENTER}
      >
        {t('onboardingMetametricsDescription2')}
      </Typography>
      <ul>
        <li>
          <Icon
            name={ICON_NAMES.CHECK}
            color={IconColor.successDefault}
            marginInlineEnd={3}
          />
          {t('onboardingMetametricsAllowOptOut')}
        </li>
        <li>
          <Icon
            name={ICON_NAMES.CHECK}
            color={IconColor.successDefault}
            marginInlineEnd={3}
          />
          {t('onboardingMetametricsSendAnonymize')}
        </li>
        <li>
          <Box>
            <Icon
              marginInlineEnd={2}
              name={ICON_NAMES.CLOSE}
              size={ICON_SIZES.SM}
              color={IconColor.errorDefault}
            />
            {t('onboardingMetametricsNeverCollect', [
              <Typography
                variant={TypographyVariant.span}
                key="never"
                fontWeight={FONT_WEIGHT.BOLD}
                marginTop={0}
              >
                {t('onboardingMetametricsNeverEmphasis')}
              </Typography>,
            ])}
          </Box>
        </li>
        <li>
          <Box>
            <Icon
              marginInlineEnd={2}
              name={ICON_NAMES.CLOSE}
              size={ICON_SIZES.SM}
              color={IconColor.errorDefault}
            />
            {t('onboardingMetametricsNeverCollectIP', [
              <Typography
                variant={TypographyVariant.span}
                key="never-collect"
                fontWeight={FONT_WEIGHT.BOLD}
              >
                {t('onboardingMetametricsNeverEmphasis')}
              </Typography>,
            ])}
          </Box>
        </li>
        <li>
          <Box>
            <Icon
              marginInlineEnd={2}
              name={ICON_NAMES.CLOSE}
              size={ICON_SIZES.SM}
              color={IconColor.errorDefault}
            />
            {t('onboardingMetametricsNeverSellData', [
              <Typography
                variant={TypographyVariant.span}
                key="never-sell"
                fontWeight={FONT_WEIGHT.BOLD}
              >
                {t('onboardingMetametricsNeverEmphasis')}
              </Typography>,
            ])}
          </Box>{' '}
        </li>
      </ul>
      <Typography
        color={TextColor.textAlternative}
        align={TEXT_ALIGN.CENTER}
        variant={TypographyVariant.H6}
        className="onboarding-metametrics__terms"
      >
        {t('onboardingMetametricsDataTerms')}
      </Typography>
      <Typography
        color={TextColor.textAlternative}
        align={TEXT_ALIGN.CENTER}
        variant={TypographyVariant.H6}
        className="onboarding-metametrics__terms"
      >
        {t('onboardingMetametricsInfuraTerms', [
          <a
            href="https://consensys.net/blog/news/consensys-data-retention-update/"
            target="_blank"
            rel="noopener noreferrer"
            key="retention-link"
          >
            {t('onboardingMetametricsInfuraTermsPolicyLink')}
          </a>,
          <a
            href="https://dextrade.com/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            key="privacy-link"
          >
            {t('onboardingMetametricsInfuraTermsPolicy')}
          </a>,
        ])}
      </Typography>

      <div className="onboarding-metametrics__buttons">
        <Button
          data-testid="metametrics-i-agree"
          type="primary"
          large
          onClick={onConfirm}
        >
          {t('onboardingMetametricsAgree')}
        </Button>
        <Button
          data-testid="metametrics-no-thanks"
          type="secondary"
          large
          onClick={onCancel}
        >
          {t('onboardingMetametricsDisagree')}
        </Button>
      </div>
    </div>
  );
}
