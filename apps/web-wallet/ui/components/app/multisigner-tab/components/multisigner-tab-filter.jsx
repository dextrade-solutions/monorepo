import Box from '@material-ui/core/Box';
import { withStyles } from '@material-ui/core/styles';
import React, { memo } from 'react';

const Wrapper = withStyles({
  root: {
    padding: '0 10px',
    marginBottom: '10px',
    display: 'flex',
    alignItem: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-alternative)',
    fontSize: '14px',
    borderBottom: '1px solid var(--color-border-muted)',
  },
})(Box);

export const MultisignerTabFilter = memo(() => {
  return (
    <Wrapper>
      <span>Create multi-signature filter</span>
    </Wrapper>
  );
});

MultisignerTabFilter.displayName = 'MultisignerTabFilter';
