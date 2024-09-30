import React, { memo } from 'react';
import { Text } from '../../../../components/component-library';
import Box from '../../../../components/ui/box';
import { AlignItems, BLOCK_SIZES, DISPLAY, TEXT_ALIGN } from '../../../../helpers/constants/design-system';
import { useI18nContext } from '../../../../hooks/useI18nContext';

const OtcExchangesFilter = () => {
  const t = useI18nContext();
  return (
    <Box
      display={DISPLAY.FLEX}
      marginTop={3}
      textAlign={TEXT_ALIGN.RIGHT}
      alignItems={AlignItems.center}
      width={BLOCK_SIZES.FULL}
    >
      <Text textAlign={TEXT_ALIGN.LEFT} className="flex-grow nowrap">
        <strong className="flex-grow">{t('providers')}</strong>
      </Text>
    </Box>
  );
};

export default memo(OtcExchangesFilter);
