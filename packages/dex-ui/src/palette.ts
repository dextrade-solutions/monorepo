const Palette = {
  light: {
    primary: {
      light: '#E5E6F6',
      main: '#4143A1',
      dark: '#203055',
      contrastText: '#fff',
    },
    background: {
      default: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#4143A1',
      dark: '#f0f1f7',
    },
    tertiary: {
      main: '#ecedfa',
      dark: '#e0e3e9',
    },
    text: {
      primary: '#4143A1',
      secondary: '#9091cd',
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
    text: {
      primary: '#FFFFFF',
      secondary: '#7C7C7C',
    },
    gradient:
      'linear-gradient(to left, var(--mui-palette-primary-light), var(--mui-palette-primary-main))',
  },
};

export default Palette;
