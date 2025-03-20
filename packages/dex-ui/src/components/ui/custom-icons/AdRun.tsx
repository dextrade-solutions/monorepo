import { Box, BoxProps } from '@mui/material';
import React from 'react';

export const AdRun = ({ sx, ...props }: BoxProps) => (
  <Box
    component="svg"
    sx={{ width: 15, height: 15, ...sx }}
    {...props}
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <svg
      width="14"
      height="15"
      viewBox="0 0 14 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_260_1460)">
        <path
          d="M7 1V6.5"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M11 2.37988C12.0669 3.2128 12.8471 4.35797 13.2318 5.65562C13.6166 6.95326 13.5867 8.33865 13.1462 9.61847C12.7058 10.8983 11.8769 12.0087 10.775 12.7948C9.67321 13.5808 8.35348 14.0034 7 14.0034C5.64652 14.0034 4.32679 13.5808 3.22497 12.7948C2.12314 12.0087 1.29418 10.8983 0.853758 9.61847C0.413331 8.33865 0.383406 6.95326 0.768159 5.65562C1.15291 4.35797 1.93315 3.2128 3 2.37988"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_260_1460">
          <rect
            width="14"
            height="14"
            fill="white"
            transform="translate(0 0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  </Box>
);
