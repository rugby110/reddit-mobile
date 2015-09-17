import React from 'react';
import constants from '../../constants';
import querystring from 'querystring';

import BasePage from './BasePage';
import ListingList from '../components/ListingList';
import Loading from '../components/Loading';
import SearchBar from '../components/SearchBar';
import SearchSortSubnav from '../components/SearchSortSubnav';
import TrackingPixel from '../components/TrackingPixel';

const _searchMinLength = 3;
const _searchLimit = 25;

class SearchPage extends BasePage {
  constructor(props) {
    super(props);

    if ((!this.state.data || !this.state.data.search) && props.ctx.query.q) {
      this.state.loaded = false;
      this._loadSearchResults();
    }

    this._lastQueryKey = null;
  }

  _loadSearchResults() {
    this.props.data.get('search').then(function(results) {
      var oldData = this.state.data;

      this.setState({
        data: Object.assign({}, oldData, {
          search: results,
        }),
        loaded: true,
      });
    }.bind(this));
  }

  _onSubmitSearchForm(e) {
    // Let the input change handle submission
    e.preventDefault();
  }

  _composeUrl(data) {
    var qs = { q: data.query };
    if (data.after) { qs.after = data.after; }
    if (data.before) { qs.before = data.before; }
    if (data.page) { qs.page = data.page; }
    if (data.sort) { qs.sort = data.sort; }
    if (data.time) { qs.time = data.time; }
    if (data.type) { qs.type = data.type; }

    return (data.subredditName ? `/r/${data.subredditName}` : '') +
      '/search?' + querystring.stringify(qs);
  }

  _composeSortingUrl(data) {
    var props = this.props;
    var qs = { q: props.ctx.query.q };
    if (props.after) { qs.after = props.after; }
    if (props.before) { qs.before = props.before; }
    if (props.page) { qs.page = props.page; }

    if (data.isSort) {
      if (props.time) { qs.time = props.time; }
    } else if (data.isTime) {
      if (props.sort) { qs.sort = props.sort; }
    }

    return (props.subredditName ? `/r/${props.subredditName}` : '') +
      '/search?' + querystring.stringify(qs);
  }

  _generateUniqueKey() {
    return Math.random().toString(36).substr(2, 9);
  }

  handleShowMoreClick(e) {
    var props = this.props;

    var url = this._composeUrl({
      query: props.ctx.query.q,
      type: 'sr',
    });

    this.props.app.redirect(url);
  }

  handleInputChanged(data) {
    var props = this.props;
    var value = data.value || '';

    if (value !== props.ctx.query.q && (value || value.length >= _searchMinLength)) {
      var url = this._composeUrl({
        query: value,
        subredditName: props.subredditName
      });

      this.props.app.redirect(url);
    }
  }

  render() {
    var state = this.state;
    var props = this.props;
    var app = this.props.app;
    var apiOptions = props.apiOptions;
    var controls;
    var tracking;

    if (!state.loaded && props.ctx.query && props.ctx.query.q) {
      controls = (
        <Loading />
      );
    } else if (!this.state.data.search) {
      controls = (
        <div className={ `container no-results text-right text-special ${noResult &&props.ctx.query.q ? '' : 'hidden'}` } key="search-no-results">
          Sorry, we couldn't find anything.
        </div>
      );
    } else {
      // to make life easier
      var searchResults = this.state.data.search;

      var subreddits = searchResults.subreddits || [];
      var listings = searchResults.links || [];
      var noListResults = listings.length === 0;
      var noSubResults = subreddits.length === 0;
      var noResult = noSubResults && noListResults;
      var subredditResultsOnly = props.subredditName && props.ctx.query.q;

      var page = props.page || 0;

      var meta = state.data.subreddits ? state.data.subreddits.meta : {};

      // API is messed up, so we have to do our own detection for the prev..
      var prevUrl = (meta.before || listings.length && page > 0) ? this._composeUrl({
        query: props.ctx.query.q,
        subredditName: props.subredditName,
        before: meta.before || listings[0].name,
        page: page - 1,
        sort: props.sort,
        time: props.time,
      }) : null;

      // ..and of course for the next too :-\
      var nextUrl = (meta.after || (props.before && listings.length)) ? this._composeUrl({
        query: props.ctx.query.q,
        subredditName: props.subredditName,
        after: meta.after || listings[listings.length - 1].name,
        page: page + 1,
        sort: props.sort,
        time: props.time,
      }) : null;

      controls = [

        <div className={ `container subreddit-only text-left ${subredditResultsOnly ? '' : 'hidden'}` } key="search-subreddit-only">
          <span>{ `${listings.length}${nextUrl ? '+' : ''} matches in /r/${props.subredditName}.` }</span>
          <a href={ this._composeUrl({ query: props.ctx.query.q }) }>Search all of reddit?</a>
        </div>,

        <div className={ `container summary-container ${noSubResults || (!noListResults && subredditResultsOnly) ? 'hidden' : ''}` }
             ref='summary' key="search-summary">
          <h4 className="text-center">Subreddits</h4>
          <ul className="subreddits-list">
            {
              subreddits.map(function (subreddit, idx) {
                return (
                  <li className="subreddits-list-item" key={ `search-subreddit-${idx}` }>
                    <a href={subreddit.url} title={subreddit.display_name} className="subreddit-link">
                      <span className="subreddit-name">{subreddit.display_name} </span>
                    </a>
                  </li>
                );
              })
            }
          </ul>

          <button className={ `btn-show-more btn-link pull-right ${subreddits.length > 3 ? 'hidden' : ''}` }
                  title="Show more" onClick={this.handleShowMoreClick.bind(this)}>Show more</button>
        </div>,

        <div className={ `container listing-container ${noListResults ? 'hidden' : ''}` }
             ref="listings" key="search-listings">

          <h4 className="text-center">Posts</h4>

          <SearchSortSubnav
            app={ app }
            sort={ props.sort }
            time={ props.time }
            composeSortingUrl={ this._composeSortingUrl.bind(this) }
          />
          <ListingList
            app={ app }
            listings={ listings}
            apiOptions={ apiOptions }
            user={ props.user }
            token={ props.token }
          />
          <div className="row pageNav">
            <div className="col-xs-12">
              <p>
                <a href={ prevUrl } className={ `btn btn-sm btn-primary ${prevUrl ? '' : 'hidden'}` } rel="prev">
                  <span className='glyphicon glyphicon-chevron-left'></span>
                  Previous Page
                </a>
                <a href={ nextUrl } className={ `btn btn-sm btn-primary ${nextUrl ? '' : 'hidden'}` } rel="next">
                  Next Page
                  <span className='glyphicon glyphicon-chevron-right'></span>
                </a>
              </p>
            </div>
          </div>
        </div>
      ];
    }

    if (meta && meta.tracking) {
      tracking = (
        <TrackingPixel
          referrer={ props.referrer }
          url={ meta.tracking }
          user={ this.props.user }
          loid={ props.loid }
          loidcreated={ props.loidcreated }
        />);
    }

    return (
      <div className='search-main'>
        <div className="container search-bar-container">
          <form action='/search' method='GET' ref='searchForm' onSubmit={ this._onSubmitSearchForm }>
            <div className='input-group vertical-spacing-top'>
              <SearchBar
                {...this.props}
                inputChangedCallback={ this.handleInputChanged.bind(this) }
              />
              <span className='input-group-btn'>
                <button className='btn btn-default' type='submit'>Search!</button>
              </span>
            </div>
          </form>
        </div>

        { controls }

        { tracking }
      </div>
    );
  }

  static isNoRecordsFound(data) {
    return ((data || {}).links || []).length === 0 &&
           ((data || {}).subreddits || []).length === 0
  }
}

//TODO: someone more familiar with this component could eventually fill this out better
SearchPage.propTypes = {
  after: React.PropTypes.string,
  // apiOptions: React.PropTypes.object,
  before: React.PropTypes.string,
  data: React.PropTypes.object,
  page: React.PropTypes.number.isRequired,
  query: React.PropTypes.object.isRequired,
  sort: React.PropTypes.string.isRequired,
  subredditName: React.PropTypes.string,
  subreddits: React.PropTypes.object,
  time: React.PropTypes.string.isRequired,
};

export default SearchPage;
