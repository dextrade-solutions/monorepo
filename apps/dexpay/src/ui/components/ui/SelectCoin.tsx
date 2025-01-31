import {
  Box,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  MenuList,
  ListItem,
  TextField,
  Skeleton,
} from '@mui/material';
import { getCoinIconByUid } from 'dex-helpers';
import { UrlIcon } from 'dex-ui';

import { useQuery } from '../../hooks/use-query';
import { Currency } from '../../services';

export function SelectCoin() {
  const coins = useQuery(Currency.coins);

  const allCoins = coins.data?.list.currentPageResult || [];
  const preloader = () => {
    return (
      <Box>
        <Skeleton width="100%" height={30} />
        <Skeleton width="100%" height={30} />
        <Skeleton width="100%" height={30} />
      </Box>
    );
  };
  return (
    <Box>
      {coins.isLoading ? (
        preloader()
      ) : (
        <MenuList>
          <ListItem>
            <TextField placeholder="Search coin..." fullWidth />
          </ListItem>
          {allCoins.map((i) => (
            <ListItemButton id={i.id}>
              <ListItemAvatar>
                <UrlIcon url={getCoinIconByUid(i.iso.toLowerCase())} />
              </ListItemAvatar>
              <ListItemText primary={i.iso} />
            </ListItemButton>
          ))}
        </MenuList>
      )}
    </Box>
  );
}
