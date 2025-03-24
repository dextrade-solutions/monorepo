import { Modal, Box } from '@mui/material';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

interface LoaderContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const LoaderContext = createContext<LoaderContextType>({
  isLoading: false,
  setLoading: () => {},
});

export const useLoaderContext = () => useContext(LoaderContext);

function initPreloader() {
  const isSafari = () => {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  };

  const isIOSWeb = () => {
    return /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
  };

  const video = document.getElementById(
    'preloaderVideo',
  ) as HTMLVideoElement | null;
  if (!video) {
    return;
  }

  const getSupportedFormat = () => {
    if (isIOSWeb() || isSafari()) {
      return { src: '/images/logo/logo-animated.mov' };
    }
    return { src: '/images/logo/logo-animated.webm', type: 'video/webm' };
  };
  const source = document.getElementById(
    'videoSource',
  ) as HTMLSourceElement | null;
  const format = getSupportedFormat();

  if (source) {
    source.src = format.src;
    if (format.type) {
      source.type = format.type;
    }
    video.load(); // Reload the video element to apply changes
  }
}

export const LoaderVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      initPreloader();
    }
  }, [videoRef]);

  return (
    <video
      ref={videoRef}
      id="preloaderVideo"
      width="150px"
      autoPlay
      loop
      muted
      playsInline
    >
      <source id="videoSource" />
      Your browser does not support the video tag.
    </video>
  );
};

export const LoaderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setLoading] = useState(false); // Changed initial state to true

  const renderLoader = () => {
    return (
      <Modal
        sx={{
          zIndex: 1000,
        }}
        keepMounted
        open={isLoading} // Changed open to isLoading
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
          <LoaderVideo />
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
