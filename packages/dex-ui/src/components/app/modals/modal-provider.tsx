import { Box, Modal, SwipeableDrawer } from '@mui/material';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { isMobileWeb } from 'dex-helpers';
import React, { useState } from 'react';

import './styles.scss';

import {
  GlobalModalContext,
  initalState,
  MODAL_COMPONENTS,
} from './modal-context';
import { ModalData, ShowModalArgs } from './types';

const Puller = styled('div')(({ theme }) => ({
  width: 30,
  height: 6,
  backgroundColor: grey[300],
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)',
  // ...theme.applyStyles('dark', {
  //   backgroundColor: grey[900],
  // }),
}));

export const ModalProvider = ({ children, modals }) => {
  const [store, setStore] = useState<ModalData>(initalState.store);

  const showModal = ({ name, ...props }: ShowModalArgs) => {
    setStore({
      ...store,
      ...{
        open: true,
        modalState: {
          name,
          props,
        },
      },
    });
  };

  const hideModal = () => {
    setStore(initalState.store);
  };

  const allModals = {
    ...MODAL_COMPONENTS,
    ...modals,
  };
  const ModalComponent =
    store.modalState.props.component || allModals[store.modalState.name];
  console.log(store.open, store.modalState.name);

  const renderContent = () =>
    ModalComponent && (
      <ModalComponent
        id="global-modal"
        {...store.modalState.props}
        hideModal={hideModal}
      />
    );

  const renderModal = () => {
    if (isMobileWeb) {
      return (
        <SwipeableDrawer
          anchor="bottom"
          onOpen={() => {}}
          onClose={hideModal}
          open={store.open}
          sx={(theme) => ({
            '& .MuiDrawer-paper': {
              backgroundImage:
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(0deg, #1D1D1D 0%, #1D1D1D 90%, #3F265F 130%)'
                  : 'none',
            },
          })}
          PaperProps={{
            sx: {
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            },
          }}
        >
          <Puller />
          {renderContent()}
        </SwipeableDrawer>
      );
    }
    return (
      <Modal onClose={hideModal} open={store.open}>
        <Box sx={{ bgcolor: 'background.default' }} className="modal-generic">
          {renderContent()}
        </Box>
      </Modal>
    );
  };
  return (
    <GlobalModalContext.Provider value={{ store, showModal, hideModal }}>
      {renderModal()}
      {children}
    </GlobalModalContext.Provider>
  );
};

export default ModalProvider;
