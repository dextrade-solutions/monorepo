import { connect } from 'react-redux';
import TabsComponent from './tabs.component';

const mapStateToProps = (state) => {
  const {
    appState: { isLoading },
  } = state;

  return {
    isLoading,
  };
};

export default connect(mapStateToProps, null, null, { forwardRef: true })(
  TabsComponent,
);
