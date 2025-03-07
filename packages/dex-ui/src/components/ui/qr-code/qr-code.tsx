import { Box, Button } from '@mui/material';
import QRCodeStyling from 'qr-code-styling';
import React, { useEffect, useRef } from 'react';

import CopyData from '../copy-data/copy-data';
import Icon from '../icon';

interface QRCodeProps {
  value: string;
  showQrValue?: boolean;
  description?: string;
  size?: number;
  hideDownloadQr?: boolean;
}

export function QRCode({
  value,
  showQrValue,
  description,
  hideDownloadQr,
  size = 300,
}: QRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!qrCode.current) {
      qrCode.current = new QRCodeStyling({
        width: size,
        height: size,
        type: 'svg',
        data: value,
        dotsOptions: {
          color: '#000000',
          gradient: {
            type: 'linear',
            rotation: 45,
            colorStops: [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#8b5cf6' },
            ],
          },
          type: 'rounded',
        },
        backgroundOptions: {
          color: 'transparent',
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 0,
        },
      });
    }

    if (qrRef.current && qrCode.current) {
      qrRef.current.innerHTML = '';
      qrCode.current.append(qrRef.current);
    }
  }, []);

  useEffect(() => {
    if (qrCode.current) {
      qrCode.current.update({
        data: value,
      });
    }
  }, [value]);

  const handleDownload = () => {
    if (qrCode.current) {
      qrCode.current.download({
        extension: 'png',
        name: 'qr-code',
      });
    }
  };

  return (
    <Box
      data-testid="qrcode"
      sx={{
        p: 2,
        m: 2,
        gap: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box
        ref={qrRef}
        data-testid="qrcode-svg"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: size,
          height: size,
        }}
      />
      {description}
      {showQrValue && (
        <Box
          textAlign="center"
          width="100%"
          whiteSpace="nowrap"
          fontWeight="bold"
        >
          <CopyData data={value} />
        </Box>
      )}
      {!hideDownloadQr && (
        <Button
          data-testid="qrcode-downloadbtn"
          variant="contained"
          startIcon={<Icon name="save" />}
          onClick={handleDownload}
          sx={{ mt: 1 }}
        >
          Download QR Code
        </Button>
      )}
    </Box>
  );
}
