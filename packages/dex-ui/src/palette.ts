const Palette = {
  light: {
    primary: {
      light: '#fff',
      main: '#3662CF',
      dark: '#203055',
      contrastText: '#fff',
    },
    background: {
      default: '#EAEEF4',
    },
    secondary: {
      light: '#ff7961',
      main: '#3662CF',
      dark: '#f0f1f7',
      contrastText: '#000',
    },
    tertiary: {
      main: '#f7f8fa',
      dark: '#e0e3e9',
    },
    text: {
      primary: '#26282D',
      secondary: '#9DA0A8',
    },
  },
  dark: {
    primary: {
      // light: '#C3CFF6',
      main: '#3662CF',
      dark: '#091122',
      light: '#2D2338',
      // contrastText: '#3662CF',
      // #050715
    },
    secondary: {
      main: '#33366D',
      dark: '#252527',
    },
    tertiary: {
      main: '#3d2f4c',
      dark: '#0c1323',
    },
    success: {
      main: '#4caf50',
      dark: '#2e7d32',
    },
    background: {
      default: '#1D1D1D',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#7C7C7C',
    },
    gradient:
      'linear-gradient(to left, var(--mui-palette-primary-light), var(--mui-palette-primary-main))',
  },
};

export default Palette;
