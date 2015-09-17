import React from 'react';
import constants from '../../constants';
import querystring from 'querystring';

import BaseComponent from './BaseComponent';
import Dropdown from '../components/Dropdown';
import SortDropdown from '../components/SortDropdown';

class UserActivitySubnav extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      opened: false,
      sort: props.sort || 'hot',
      activity: props.activity || 'comments',
    };

    this._onOpen = this._onOpen.bind(this);
    this._id = Math.random();
  }

  componentDidMount() {
    this.props.app.on(constants.DROPDOWN_OPEN + ':' + this._id, this._onOpen);
  }

  componentWillUnmount() {
    this.props.app.off(constants.DROPDOWN_OPEN + ':' + this._id, this._onOpen);
  }

  _onOpen(bool) {
    this.setState({
      opened: bool,
    });
  }

  buildUrl(base, activity, sort, page) {
    var url = base;

    var q = {
      activity: activity,
    };

    if (sort) {
      q.sort = sort;
    }

    if (page) {
      q.page = page;
    }

    return url + '?' + querystring.stringify(q);
  }

  render() {
    var baseUrl = `/u/${this.props.name}/activity`;
    var activity = this.state.activity;
    var sortList = 'comments';

    switch (activity) {
      case 'listings':
        sortList = 'listings';
        break;
      case 'overview':
      case 'gilded':
        sortList = 'both';
        break;
    }

    var dropdownList = [
      {
        activity: 'comments',
        text: 'Submitted comments',
      },
      {
        activity: 'submitted',
        text: 'Submitted posts',
      },
      {
        activity: 'overview',
        text: 'Comments and posts',
      },
      {
        activity: 'gilded',
        text: 'Gilded',
      },
    ];

    var activityTitle = dropdownList.find((d) => {
      return d.activity === activity;
    }).text;

    var button = (
      <button className={(this.state.opened ? ' opened' : '')}>
        { activityTitle } <span className='icon-caron'/>
      </button>
    );
    var opened = this.state.opened;

    // add user to the bar as well
    var user = this.props.user;
    if (user) {
      var loginLink = <a className='TopSubnav-a' href={ '/u/' + user.name }>{ user.name }</a>;
    } else {
      loginLink = <a className='TopSubnav-a' href={ this.props.app.config.loginPath } data-no-route='true'>Log in / Register</a>;
    }

    var props = this.props;

    return (
      <div className='TopSubnav'>
        <Dropdown
          id={ this._id }
          button={ button }
          app={ this.props.app }
          className='Dropdown-inline'>
          {
            dropdownList.map((d) => {
              var iconClass = opened && activity === d.activity ? 'icon-check-shown' : 'icon-check-hidden';
              return (
                <li className='Dropdown-li' key={`ua-subnav-${d.text}`}>
                  <a className='Dropdown-button' href={ this.buildUrl(baseUrl, d.activity, this.state.sort, this.state.page) }>
                    <span className={'icon-check ' + iconClass }>{' '}</span>
                    <span className='Dropdown-text'>{ d.text }</span>
                  </a>
                </li>
              );
            })
          }
        </Dropdown>

        <span className='text-muted'> sorted by </span>

        <SortDropdown
          app={ this.props.app }
          sort={ this.state.sort }
          list={ sortList }
          baseUrl={ this.buildUrl(baseUrl, this.state.activity) }
          className='Dropdown-inline'
        />

        <div className='pull-right'>{ loginLink }</div>
      </div>
    );
  }
}

UserActivitySubnav.propTypes = {
  activity: React.PropTypes.string,
  name: React.PropTypes.string.isRequired,
  sort: React.PropTypes.string,
};

export default UserActivitySubnav;
