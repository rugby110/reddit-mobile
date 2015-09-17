import React from 'react/addons';
import constants from '../../constants';
import mobilify from '../../lib/mobilify';
import { models } from 'snoode';
import moment from 'moment';
import propTypes from '../../propTypes';
import short from '../../lib/formatDifference';
import savedReply from '../../lib/savedReply';

import BaseComponent from './BaseComponent';
import CommentBox from '../components/CommentBox';
import ListingDropdown from '../components/ListingDropdown';
import ReportPlaceholder from '../components/ReportPlaceholder';
import Vote from '../components/Vote';

var replyIcon = (
  <span className='icon-reply-circled'>{' '}</span>
);

class Comment extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      comment: this.props.comment,
      collapsed: this.props.comment.hidden,
      showReplyBox: false,
      showTools: false,
      favorited: false,
      optionsOpen: false,
      reported: false,
      hidden: false,
      score: this.props.comment.score,
      editing: false,
    }

    this.setScore = this.setScore.bind(this);
  }

  componentDidMount () {
    var hasSavedReply = !!savedReply.get(this.props.comment.name);

    if (hasSavedReply) {
      this.setState({
        showReplyBox: hasSavedReply,
        showTools: hasSavedReply,
      });

      React.findDOMNode(this).scrollIntoView();
    }

    this.onReport = this.onReport.bind(this);
  }

  setScore (score) {
    this.setState({
      score: score,
    });
  }

  onReport () {
    this.setState({ reported: true });
  }

  onHide () {
    this.setState({ hidden: true });
  }

  // The collapsy icon
  collapse (e) {
    e.preventDefault();
    this.setState({
      collapsed: !this.state.collapsed,
      showTools: false,
      showReplyBox: false,
      optionsOpen: false,
    })
  }

  showReplyBox (e) {
    e.preventDefault();

    this.setState({
      showReplyBox: !this.state.showReplyBox,
    });
  }

  favorite (e) {
    e.preventDefault();

    this.setState({
      favorited: !this.state.favorited,
    });
  }

  openOptions (e) {
    e.preventDefault();

    this.setState({
      optionsOpen: !this.state.optionsOpen
    });
  }

  onNewComment (comment) {
    this.state.comment.replies = this.state.comment.replies || [];
    this.state.comment.replies.splice(0, 0, comment);

    this.setState({
      comment: this.state.comment,
      collapsed: false,
      showReplyBox: false,
      showTools: false,
      optionsOpen: false,
    });
  }

  showTools (e) {
    this.setState({ showTools: !this.state.showTools });
  }

  toggleEdit () {
    this.setState({
      editing: !this.state.editing,
    })
  }

  onDelete (id) {
    var props = this.props;
    var options = this.props.app.api.buildOptions(props.apiOptions);

    options = Object.assign(options, {
      id: id,
    });

    // nothing returned for this endpoint
    // so we assume success :/
    this.props.app.api.comments.delete(options).then(function(){
      var deletedComment = this.state.comment;
      deletedComment.body_html = '<p>[deleted]</p>';
      deletedComment.author = '[deleted]';
      this.setState({
        comment: deletedComment
      })
    }.bind(this))
  }

  updateComment () {
    var props = this.props;
    var newText = this.refs.updatedText.getDOMNode().value;
    var comment = this.state.comment;
    if (comment.body === newText) {
      return;
    }

    var comment = new models.Comment(this.state.comment);
    var options = this.props.app.api.buildOptions(props.apiOptions);

    options = Object.assign(options, {
      model: comment,
      changeSet: newText,
    });
    // update comment here
    this.props.app.api.comments.patch(options).then(function(res) {
      if (res.data) {
        this.setState({
          comment: res.data,
          editing: false,
        })
        this.props.app.emit('comment:edit');
      }
    }.bind(this), function(err) {
      this.setState({
        editError: err,
      }.bind(this))
    })
  }

  preventPropagation (e) {
    e.stopPropagation();
  }

  render () {
    if (this.state.hidden) {
      return (<div />);
    }

    if (this.state.reported) {
      return (<ReportPlaceholder />);
    }

    var props = this.props;
    var comment = this.state.comment;

    var authorFlair;
    var level = props.nestingLevel;
    var submitted = short(comment.created_utc * 1000);
    var op = props.op;

    var edited = props.edited ? '* ' : '';
    var opClass = '';
    var commentCollapseClass = '';
    var gilded;
    var vote;

    var distinguished = comment.distinguished ? ' text-' + comment.distinguished : '';

    var commentBox;
    var toolbox;
    var highlighted = '';

    var permalink;

    if (this.props.permalinkBase) {
      permalink = this.props.permalinkBase + comment.id;
    }

    var showEdit = false;
    var showDel;
    if (props.user) {
      showEdit = props.user.name === comment.author;
      showDel = showEdit;
    }

    if (this.state.showTools || props.highlight === comment.id) {
      highlighted = 'comment-highlighted';

      if (this.state.showReplyBox) {
        commentBox = (
          <CommentBox
            {...props}
            ref='commentBox'
            thingId={ comment.name }
            onSubmit={ this.onNewComment.bind(this) }
          />
        );
      }
      toolbox = (
        <ul className='linkbar-spread linkbar-spread-5 comment-toolbar clearfix'>
          <li>
            <a className='MobileButton comment-svg' onClick={this.showReplyBox.bind(this)} href='#' >{ replyIcon }</a>
          </li>
          <li className='linkbar-spread-li-double comment-vote-container comment-svg'>
            <Vote
              app={ this.props.app }
              setScore={ this.setScore }
              thing={ this.props.comment }
              token={ this.props.token }
              apiOptions={ this.props.apiOptions }
            />
          </li>
          <li>
            <div className="encircle-icon encircle-options-icon">
              <ListingDropdown
                app={ props.app }
                viewComments={ false }
                saved={ props.comment.saved }
                subreddit={ props.subredditName }
                permalink={ permalink }
                onReport={ this.onReport }
                token={ props.token }
                apiOptions={ props.apiOptions }
                listing={props.comment}
                showEdit={ showEdit }
                onEdit={ this.toggleEdit.bind(this) }
                showDel={ showDel }
                onDelete={ this.onDelete.bind(this, props.comment.name) }
                />
            </div>
          </li>
        </ul>
      );
    }

    if (comment.author_flair_text) {
      authorFlair = <span className={ 'label label-default ' + comment.author_flair_css_class }>
        { comment.author_flair_text }
      </span>;
    }

    if (op == comment.author) {
      opClass = 'comment-op';
    }
    var collapsed = this.state.collapsed;

    if (comment.gilded) {
      gilded = (
        <span className='icon-gold-circled'/>
      );
    }

    if (comment.replies && !collapsed) {
      if ( !this._childrenKey ) {
        this._childrenKey = 'children' + Math.random();
      }
      var children = (
        <div className='comment-children comment-content'>
          {
            comment.replies.map(function(c, i) {
              if (c) {
                var key = 'page-comment-' + c.name + '-' + i;

                return (
                  <Comment
                    {...props}
                    comment={c}
                    key={key}
                    nestingLevel={level + 1}
                    op={op}
                  />
                );
              }
            })
          }
        </div>
      );
    }

    if (!collapsed) {
      if ( !this._bodyKey ) {
        this._bodyKey = 'body' + Math.random();
      }
      var body = (
        <div className='comment-body'>
          <div className='comment-content vertical-spacing-sm' dangerouslySetInnerHTML={{
              __html: comment.body_html
            }}
            onClick={this.showTools.bind(this)} />

          <footer className='comment-footer'>
            { toolbox }
            { commentBox }
          </footer>
        </div>
      );
    }

    if (this.state.editing) {
      var errorClass = 'visually-hidden';
      var errorText = '';

      if (this.state.editError) {
        var err = props.editError[0];
        errorClass = 'alert alert-danger alert-bar';
        errorText = err[0] + ': ' + err[1];
      }

      body = (
        <div className='comment-edit-box'>
          <div className={ errorClass } role='alert'>
            { errorText }
          </div>
          <div className='comment-textarea-holder'>
            <textarea ref='updatedText' className='form-control zoom-fix' defaultValue={ comment.body }></textarea>
          </div>
          <div className='btn-group btn-group-justified'>
            <div className='btn-group'>
              <button className='btn btn-primary btn-block' type='button' onClick={ this.toggleEdit.bind(this) }>Cancel</button>
            </div>
            <div className='btn-group'>
              <button className='btn btn-primary btn-block' type='button' onClick={ this.updateComment.bind(this) }>Save</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className='comment'>
        <div className={ commentCollapseClass }>
          <article className={`comment-article ${highlighted}`}>
            <div className={'comment-submitted' + (collapsed ? ' comment-header comment-collapsed' : '')}>
              <a href='#' onClick={ this.collapse.bind(this) }>
                <ul className='linkbar linkbar-compact tween comment-title-list'>
                  <li className={'comment-title-collapse-container twirly before' + (collapsed ? '' : ' opened')}>
                  </li>
                  <li className="comment-title-username">
                    <span className={ opClass + " " + distinguished }>
                      { comment.author }
                    </span>

                    { authorFlair }

                    { gilded }
                  </li>
                  <li className='comment-timestamp-score'>
                    <span className='comment-timestamp'>{ submitted }</span>
                    <span className='comment-title-score'>
                      { comment.score_hidden ? '[score hidden]' : this.state.score }
                    </span>
                  </li>
                </ul>
              </a>
            </div>
            { body }
          </article>
           { children }
        </div>
      </div>
    );
  }
}

// TODO: someone more familiar with this component could eventually fill this out better
Comment.propTypes = {
  // apiOptions: React.PropTypes.object,
  comment: propTypes.comment.isRequired,
  // edited: React.PropTypes.bool.isRequired,
  // editError: React.PropTypes.array.isRequired,
  // highlight: React.PropTypes.string.isRequired,
  // nestingLevel: React.PropTypes.number.isRequired,
  // op: React.PropTypes.string.isRequired,
  // permalinkBase: React.PropTypes.string.isRequired,
  subredditName: React.PropTypes.string.isRequired,
};

export default Comment;
