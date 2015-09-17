import React from 'react';
import BaseComponent from './BaseComponent';

class CaptchaBox extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      captchaSrc: '',
      iden: this.props.iden || '',
    }
  }

  componentDidMount() {
    if (!this.state.iden) {
      this.requestCaptcha();
    } else {
      var captchaSrc = this._makeCaptchaUrl(this.state.iden);
      this.setState({captchaSrc: captchaSrc});
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.iden === '') {
      this.requestCaptcha();
    }
  }

  requestCaptcha() {
    var api = this.props.app.api;

    var options = api.buildOptions(this.props.apiOptions);
    options.form = {};
    options.form.api_type = 'json'

    api.captcha.post(options).then(function(data) {
      var iden = data.iden;
      var src = this._makeCaptchaUrl(iden);

      this.setState({
        captchaSrc: src,
        iden: iden,
      });

      this.props.cb({
        iden: this.state.iden,
        answer: ''
      });

    }.bind(this))
  }

  _makeCaptchaUrl (iden) {
    return 'https://www.reddit.com/captcha/' + iden;
  }

  newCaptcha() {
    this.requestCaptcha();
  }

  _updateCaptchaInfo() {
    var answer = this.refs.answer.getDOMNode().value
    var info = {
      answer: answer,
      iden: this.state.iden,
    }
    this.props.cb(info);
  }

  render() {
    var errorClass = this.props.error ? 'has-error' : '';
    var errorText = errorClass ? '' : 'visually-hidden';

    var img = (
      <span className='captcha-loading-text'>Loading...</span>
    );
    if (this.state.captchaSrc) {
      img = (
        <img width='120' height='50' src={this.state.captchaSrc} />
      );
    }

    return (
      <div className={ 'captcha-wrap ' + errorClass }>
        <div className='captcha-img-wrap'>
          { img }
        </div>
        <div className='captcha-zoom-wrapper'>
          <input
            className='form-control zoom-fix'
            ref='answer'
            type='text'
            onChange={this._updateCaptchaInfo.bind(this)}
            defaultValue={this.props.answer}
          />
        </div>
        <div className='captcha-new-link'>
          <p className={'text-danger ' + errorText }>That did not seem to match. Please try again.</p>
          <a  href='#' onClick={this.newCaptcha.bind(this)}>get a new code</a>
        </div>
        <button
          type='button'
          className='btn btn-primary btn-block'
          onClick={this.props.action}
        >{ this.props.actionName }</button>
      </div>
    );

  }

}

// TODO: someone more familiar with this component could eventually fill this out better
CaptchaBox.propTypes = {
  action: React.PropTypes.func.isRequired,
  actionName: React.PropTypes.string.isRequired,
  answer: React.PropTypes.string.isRequired,
  // apiOptions: React.PropTypes.object,
  cb: React.PropTypes.func.isRequired,
  // error: React.PropTypes.bool.isRequired,
  // iden: React.PropTypes.string.isRequired,
};

export default CaptchaBox;
