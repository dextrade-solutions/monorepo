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
        width: '100vw',
        height: '45vh', // Or specify a fixed height
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 393 373' preserveAspectRatio='none' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_353_2918)'%3E%3Cpath d='M96.4949 101.931C51.2119 58.4708 4.04745 66.4384 -42.0075 23.8771C-176.047 -99.9948 315.414 -131.063 415.755 23.8771C483.807 128.958 415.755 349 415.755 349C415.755 349 365.09 280.084 320.094 253.737C269.385 224.044 222.816 253.468 175.136 218.705C131.404 186.821 135.779 139.634 96.4949 101.931Z' fill='url(%23paint0_linear_353_2918)'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_353_2918' x='-85' y='-97' width='551' height='470' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='4'/%3E%3CfeGaussianBlur stdDeviation='10'/%3E%3CfeComposite in2='hardAlpha' operator='out'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.782747 0 0 0 0 0.782747 0 0 0 0 0.782747 0 0 0 0.8 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_353_2918'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_353_2918' result='shape'/%3E%3C/filter%3E%3ClinearGradient id='paint0_linear_353_2918' x1='-60.4527' y1='-186.599' x2='468.084' y2='-163.84' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0.1192' stop-color='%2300C283'/%3E%3Cstop offset='0.8747' stop-color='%233C76FF'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E")`, // Encoded SVG as background image
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        animation: `${gradientShift} 2s cubic-bezier(0.83, 0, 0.17, 1) forwards`,
      }}
    />
  );
}
