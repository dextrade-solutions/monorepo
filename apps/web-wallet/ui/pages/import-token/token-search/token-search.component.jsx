import { InputAdornment } from '@mui/material';
import Fuse from 'fuse.js';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { isEqualCaseInsensitive } from '../../../../shared/modules/string-utils';
import SearchIcon from '../../../components/ui/icon/search-icon';
import TextField from '../../../components/ui/text-field';

export default class TokenSearch extends Component {
  static contextTypes = {
    t: PropTypes.func,
  };

  static defaultProps = {
    error: null,
  };

  static propTypes = {
    onSearch: PropTypes.func,
    error: PropTypes.string,
    tokenList: PropTypes.object,
  };

  state = {
    searchQuery: '',
  };

  constructor(props) {
    super(props);
    const { tokenList } = this.props;
    this.tokenList = Object.values(tokenList);
    this.tokenSearchFuse = new Fuse(this.tokenList, {
      shouldSort: true,
      threshold: 0.45,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        { name: 'name', weight: 0.5 },
        { name: 'symbol', weight: 0.4 },
        { name: 'localId', weight: 0.1 },
      ],
    });
    this.props.onSearch({ searchQuery: '', results: this.tokenList });
  }

  handleSearch(searchQuery) {
    this.setState({ searchQuery });
    const fuseSearchResult = this.tokenSearchFuse.search(searchQuery);
    const addressSearchResult = this.tokenList.filter((token) => {
      return (
        token.address &&
        searchQuery &&
        isEqualCaseInsensitive(token.address, searchQuery)
      );
    });
    const results = [...addressSearchResult, ...fuseSearchResult];
    if (searchQuery) {
      this.props.onSearch({ searchQuery, results });
    } else {
      this.props.onSearch({ searchQuery: '', results: this.tokenList });
    }
  }

  renderAdornment() {
    return (
      <InputAdornment position="start" style={{ marginRight: '12px' }}>
        <SearchIcon color="var(--color-icon-muted)" />
      </InputAdornment>
    );
  }

  render() {
    const { error } = this.props;
    const { searchQuery } = this.state;

    return (
      <TextField
        id="search-tokens"
        placeholder={this.context.t('searchTokens')}
        type="text"
        value={searchQuery}
        onChange={(e) => this.handleSearch(e.target.value)}
        error={error}
        fullWidth
        autoFocus
        autoComplete="off"
        startAdornment={this.renderAdornment()}
      />
    );
  }
}
