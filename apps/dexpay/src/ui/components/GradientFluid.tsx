import { Box, keyframes } from '@mui/material';

const gradientShift = keyframes`
  0% {
    transform: scale(1) translate(20px, -300px);
  }
  30% {
    transform: scale(1.5) translate(0px, 0px); // Adjust these values for the desired shift
  }
  100% {
    transform: scale(1) translate(0px, 0px); // Adjust these values for the desired shift
  }
`;

export function GradientFluid() {
  return (
    <Box
      sx={{
        animation: `${gradientShift} 2s cubic-bezier(0.83, 0, 0.17, 1) forwards`,
      }}
    >
      <svg
        width="100vw"
        height="45vh"
        viewBox="0 0 393 373"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_d_353_2918)">
          <path
            d="M96.4949 101.931C51.2119 58.4708 4.04745 66.4384 -42.0075 23.8771C-176.047 -99.9948 315.414 -131.063 415.755 23.8771C483.807 128.958 415.755 349 415.755 349C415.755 349 365.09 280.084 320.094 253.737C269.385 224.044 222.816 253.468 175.136 218.705C131.404 186.821 135.779 139.634 96.4949 101.931Z"
            fill="url(#paint0_linear_353_2918)"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_353_2918"
            x="-85"
            y="-97"
            width="551"
            height="470"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="10" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.782747 0 0 0 0 0.782747 0 0 0 0 0.782747 0 0 0 0.8 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_353_2918"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_353_2918"
              result="shape"
            />
          </filter>
          <linearGradient
            id="paint0_linear_353_2918"
            x1="-60.4527"
            y1="-186.599"
            x2="468.084"
            y2="-163.84"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.1192" stop-color="#00C283" />
            <stop offset="0.8747" stop-color="#3C76FF" />
          </linearGradient>
        </defs>
      </svg>
    </Box>
  );
}
