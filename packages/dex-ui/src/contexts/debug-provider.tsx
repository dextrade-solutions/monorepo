import { Box, Typography } from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';

export const DebugProvider = ({ children }: { children: React.ReactNode }) => {
  const [clickCount, setClickCount] = useState(0);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const resetTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Check system theme
    const checkSystemTheme = () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setSystemTheme(isDark ? 'dark' : 'light');
    };

    // Initial check
    checkSystemTheme();

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkSystemTheme);

    return () => {
      mediaQuery.removeEventListener('change', checkSystemTheme);
    };
  }, []);

  useEffect(() => {
    const handleClick = () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }

      const newCount = clickCount + 1;
      setClickCount(newCount);

      if (newCount === 10) {
        console.log('User Agent:', navigator.userAgent);
        setClickCount(0);
      }
    };

    if (clickCount !== 9) {
      resetTimeoutRef.current = setTimeout(() => {
        setClickCount(0);
      }, 1000);
    }

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, [clickCount]);

  const debugInfo = {
    'User Agent': navigator.userAgent,
    Platform: navigator.platform,
    Language: navigator.language,
    'Screen Resolution': `${window.screen.width}x${window.screen.height}`,
    'Viewport Size': `${window.innerWidth}x${window.innerHeight}`,
    'Pixel Ratio': window.devicePixelRatio,
    'System Theme': systemTheme,
    'Cookies Enabled': navigator.cookieEnabled,
    'Online Status': navigator.onLine,
    Memory: (navigator as any).deviceMemory
      ? `${(navigator as any).deviceMemory}GB`
      : 'N/A',
    'Concurrent Threads': (navigator as any).hardwareConcurrency || 'N/A',
    Browser: {
      Name: getBrowserName(),
      Version: getBrowserVersion(),
    },
  };

  function getBrowserName() {
    const { userAgent } = navigator;
    if (userAgent.includes('Chrome')) {
      return 'Chrome';
    }
    if (userAgent.includes('Firefox')) {
      return 'Firefox';
    }
    if (userAgent.includes('Safari')) {
      return 'Safari';
    }
    if (userAgent.includes('Edge')) {
      return 'Edge';
    }
    if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
      return 'Internet Explorer';
    }
    return 'Unknown';
  }

  function getBrowserVersion() {
    const { userAgent } = navigator;
    const matches = userAgent.match(
      /(Chrome|Firefox|Safari|Edge|MSIE|Trident(?=\/))\/?\s*(\d+)/i,
    );
    return matches ? matches[2] : 'Unknown';
  }

  return (
    <>
      {clickCount === 9 && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            right: 0,
            p: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            zIndex: 9999,
            maxWidth: '400px',
            maxHeight: '80vh',
            overflow: 'auto',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Debug Information
          </Typography>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Click 10 times to see debug info
          </Typography>

          {Object.entries(debugInfo).map(([key, value]) => (
            <Box key={key} mt={1}>
              <Typography variant="caption" color="text.secondary">
                {key}:
              </Typography>
              {typeof value === 'object' ? (
                Object.entries(value).map(([subKey, subValue]) => (
                  <Typography key={subKey} variant="body2" sx={{ ml: 1 }}>
                    {subKey}: {subValue}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {value}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}
      {children}
    </>
  );
};
