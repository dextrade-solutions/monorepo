import { ArrowLeft } from 'lucide-react';
import { Box, Container, IconButton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const TermsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
          aria-label="back"
        >
          <ArrowLeft size={24} />
        </IconButton>
        <Typography variant="h4" component="h1">
          {t('Terms of Use')}
        </Typography>
      </Box>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('1. Acceptance of Terms')}
        </Typography>
        <Typography paragraph>
          {t('By accessing and using DexTrade web tools, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our services.')}
        </Typography>

        <Typography variant="h6" gutterBottom>
          {t('2. Description of Service')}
        </Typography>
        <Typography paragraph>
          {t('DexTrade web tools provide cryptocurrency trading and exchange services. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.')}
        </Typography>

        <Typography variant="h6" gutterBottom>
          {t('3. User Responsibilities')}
        </Typography>
        <Typography paragraph>
          {t('You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.')}
        </Typography>

        <Typography variant="h6" gutterBottom>
          {t('4. Risk Disclosure')}
        </Typography>
        <Typography paragraph>
          {t('Cryptocurrency trading involves significant risk. You should only trade with funds you can afford to lose. Past performance is not indicative of future results.')}
        </Typography>

        <Typography variant="h6" gutterBottom>
          {t('5. Privacy')}
        </Typography>
        <Typography paragraph>
          {t('Your use of our services is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.')}
        </Typography>

        <Typography variant="h6" gutterBottom>
          {t('6. Limitation of Liability')}
        </Typography>
        <Typography paragraph>
          {t('DexTrade shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.')}
        </Typography>

        <Typography variant="h6" gutterBottom>
          {t('7. Changes to Terms')}
        </Typography>
        <Typography paragraph>
          {t('We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on this page.')}
        </Typography>

        <Typography variant="h6" gutterBottom>
          {t('8. Contact Information')}
        </Typography>
        <Typography paragraph>
          {t('If you have any questions about these Terms of Use, please contact us through our support channels.')}
        </Typography>
      </Box>
    </Container>
  );
}; 