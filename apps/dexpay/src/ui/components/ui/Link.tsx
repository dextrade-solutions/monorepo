import { Link } from 'wouter';
import { styled } from '@mui/material'; // Import styled

interface StyledLinkProps {
  noUnderline?: boolean; // Add the prop to the interface
}

const StyledLink = styled(Link)<StyledLinkProps>(({ theme, noUnderline }) => ({ // Pass the prop to the styled component
  color: theme.palette.text.tertiary,
  textDecoration: noUnderline ? 'none' : 'underline', // Conditionally apply text-decoration
  '&:hover': {
    textDecoration: noUnderline ? 'none' : 'underline', // Maintain the noUnderline behavior on hover
  },
}));

export default StyledLink;
