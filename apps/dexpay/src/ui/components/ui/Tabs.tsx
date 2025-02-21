import { styled, Tabs as MuiTabs } from '@mui/material';

const Tabs = styled(MuiTabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.text.tertiary,
  },
  '& .MuiTab-root': {
    fontWeight: 'bold',
    color: theme.palette.text.secondary,
    '&.Mui-selected': {
      color: theme.palette.text.tertiary,
    },
  },
}));

export default Tabs;
