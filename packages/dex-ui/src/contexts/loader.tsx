import { Modal, Box } from '@mui/material';
import React, { createContext, useContext, useState } from 'react';

interface LoaderContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const LoaderContext = createContext<LoaderContextType>({
  isLoading: false,
  setLoading: () => {},
});

export const useLoaderContext = () => useContext(LoaderContext);

export const LoaderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setLoading] = useState(false);

  const renderLoader = () => {
    return (
      <Modal
        sx={{
          zIndex: 1000,
        }}
        keepMounted
        open={isLoading}
      >
        <Box
          position="absolute"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <video width="150px" autoPlay loop muted playsInline>
            <source src="/images/logo/logo-animated.mov" type="video/mp4" />
            <source src="/images/logo/logo-animated.webm" type="video/webm" />
          </video>
        </Box>
      </Modal>
    );
  };

  return (
    <LoaderContext.Provider value={{ isLoading, setLoading }}>
      {renderLoader()}
      {children}
    </LoaderContext.Provider>
  );
};
