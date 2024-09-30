import React, { useEffect, useRef } from "react";
import { BaseQRScanner } from "./BaseQRScanner";
import { CameraStatus, ScannerProps } from "./types";
import { getAnimatedScan } from "./getAnimatedScan";
import { useCamera } from "./useCamera";

export const AnimatedQRScanner = ({
  purpose,
  urTypes,
  handleScan,
  handleError,
  options,
  videoLoaded,
  onProgress,
}: ScannerProps) => {
  const camera = useRef(CameraStatus.ACCESSING_CAMERA);
  const { cameraStatus } = useCamera();
  const { handleScanSuccess, handleScanFailure } = getAnimatedScan({
    purpose,
    urTypes,
    handleScan,
    handleError,
    onProgress,
  });

  useEffect(() => {
    if (!videoLoaded || camera.current === cameraStatus) {
      return;
    }

    if (
      cameraStatus === CameraStatus.PERMISSION_NEEDED ||
      cameraStatus === CameraStatus.NO_WEBCAM
    ) {
      videoLoaded(false, cameraStatus);
    } else if (cameraStatus === CameraStatus.READY) {
      videoLoaded(true);
    }
  }, [cameraStatus]);

  return (
    <BaseQRScanner
      handleScan={handleScanSuccess}
      handleError={handleScanFailure}
      width={options?.width}
      height={options?.height}
      blur={options?.blur}
      videoLoaded={videoLoaded}
    />
  );
};
