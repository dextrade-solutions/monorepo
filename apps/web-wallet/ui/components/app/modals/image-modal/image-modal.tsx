import { Component, ReactNode } from 'react';

import Box from '../../../ui/box';
import withModalProps from '../../../../helpers/higher-order-components/with-modal-props';

class ImageModal extends Component<{
  link: string;
}> {
  render(): ReactNode {
    return (
      <Box>
        <img
          src={this.props.link}
          style={{
            display: 'block',
            maxWidth: '100%',
            width: '100%',
            height: '100%',
          }}
        />
      </Box>
    );
  }
}

const ImageModalComponent = withModalProps(ImageModal);

export default ImageModalComponent;
