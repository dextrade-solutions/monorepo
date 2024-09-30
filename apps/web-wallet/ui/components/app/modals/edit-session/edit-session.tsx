import { useState } from 'react';
import { FormControl } from '@mui/material';
import { useDispatch } from 'react-redux';
import { Session } from '../../../../../app/scripts/controllers/exchanger/types';
import { FormTextField } from '../../../component-library';
import { dextradeRequest } from '../../../../store/actions';
import withModalProps from '../../../../helpers/higher-order-components/with-modal-props';
import Modal from '../../modal';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { Size } from '../../../../helpers/constants/design-system';

const EditSession = ({
  session,
  hideModal,
  onSubmit,
}: {
  session: Session;
  hideModal: () => void;
  onSubmit: () => Promise<void>;
}) => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const [name, setName] = useState(session.name || session.deviceId);

  return (
    <Modal
      onSubmit={async () => {
        await dispatch(
          dextradeRequest({
            method: 'POST',
            url: 'api/user/session/set/name',
            data: { id: session.id, name },
          }),
        );
        await onSubmit();
        hideModal();
      }}
      submitText={t('save')}
      onCancel={() => hideModal()}
      onClose={hideModal}
      cancelText={t('cancel')}
      headerText="Edit Session"
      submitDisabled={!name}
    >
      <FormControl fullWidth>
        <FormTextField
          label="Device name"
          autoFocus
          required
          fullWidth
          size={Size.LG}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>
    </Modal>
  );
};

export default withModalProps(EditSession);
