import { connect } from 'react-redux';
import { assetModel } from '../../../selectors';
import TokenList from './token-list.component';

const mapStateToProps = (state, ownProps) => {
  const { selectedAddress } = state.metamask;
  const results = ownProps.results.map((token) => assetModel(state, token));
  return {
    selectedAddress,
    results,
  };
};

export default connect(mapStateToProps)(TokenList);
