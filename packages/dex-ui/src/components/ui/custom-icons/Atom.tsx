import { Box, BoxProps } from '@mui/material';
import React from 'react';

interface AtomProps extends BoxProps {
  // You can add any additional props specific to Atom here
}

export const Atom = ({ sx, ...props }: AtomProps) => (
  <Box
    component="svg"
    sx={{ width: 38, height: 38, ...sx }}
    {...props}
    viewBox="0 0 38 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 20.5834C19.8744 20.5834 20.5833 19.8745 20.5833 19C20.5833 18.1256 19.8744 17.4167 19 17.4167C18.1255 17.4167 17.4167 18.1256 17.4167 19C17.4167 19.8745 18.1255 20.5834 19 20.5834Z"
      stroke="url(#paint0_linear_150_18)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M31.9833 31.9833C35.2133 28.7692 32.015 20.33 24.8583 13.1417C17.67 5.985 9.23084 2.78667 6.01667 6.01667C2.78667 9.23084 5.985 17.67 13.1417 24.8583C20.33 32.015 28.7692 35.2133 31.9833 31.9833Z"
      stroke="url(#paint1_linear_150_18)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24.8583 24.8583C32.015 17.67 35.2133 9.23084 31.9833 6.01667C28.7692 2.78667 20.33 5.985 13.1417 13.1417C5.985 20.33 2.78667 28.7692 6.01667 31.9833C9.23084 35.2133 17.67 32.015 24.8583 24.8583Z"
      stroke="url(#paint2_linear_150_18)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient
        id="paint0_linear_150_18"
        x1="17.4448"
        y1="16.639"
        x2="20.7219"
        y2="16.7578"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.1192" stopColor="#00EEA1" />
        <stop offset="0.8747" stopColor="#3C76FF" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_150_18"
        x1="5.01063"
        y1="-2.23837"
        x2="34.4899"
        y2="-1.17017"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.1192" stopColor="#00EEA1" />
        <stop offset="0.8747" stopColor="#3C76FF" />
      </linearGradient>
      <linearGradient
        id="paint2_linear_150_18"
        x1="5.01063"
        y1="-2.23837"
        x2="34.4899"
        y2="-1.17017"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.415" stopColor="#00EEA1" />
        <stop offset="0.8747" stopColor="#3C76FF" />
      </linearGradient>
    </defs>
  </Box>
);
