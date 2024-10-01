import React, { memo } from 'react';

// const Wrapper = withStyles({
//   root: {
//     padding: '0 10px',
//     marginBottom: '10px',
//     display: 'flex',
//     alignItem: 'center',
//     justifyContent: 'center',
//     color: 'var(--color-text-alternative)',
//     fontSize: '14px',
//     borderBottom: '1px solid var(--color-border-muted)',
//   },
// })(Box);

export const MultisignerTabFilter = memo(() => {
  return (
    <div>
      <span>Create multi-signature filter</span>
    </div>
  );
});

MultisignerTabFilter.displayName = 'MultisignerTabFilter';
