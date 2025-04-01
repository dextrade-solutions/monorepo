import { Box } from '@mui/material';
import { Component, ReactNode } from 'react';

import { ModalProps } from '../types';

class ImageModal extends Component<
  {
    link: string;
  } & ModalProps
> {
  render(): ReactNode {
    return (
      <Box>
        <img
          src={this.props.link}
          style={{
            display: 'block',
            maxWidth: '100%',
            width: '100%',
            // height: '100%',
          }}
        />
      </Box>
    );
  }
}

export default ImageModal;
