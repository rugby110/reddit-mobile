import React from 'react';
import querystring from 'querystring';

import BasePage from './BasePage';

class RegisterPage extends BasePage {
  render () {
    var usernameClass = '';
    var passwordClass = '';
    var emailClass = '';

    var errorClass = 'visually-hidden';

    var dest = this.props.ctx.query.originalUrl;
    var linkDest = '';
    var refererTag = '';
    var message;

    if (dest) {
      linkDest = '/?' + querystring.stringify({
        originalUrl: dest,
      });
      refererTag = <input type='hidden' name='originalUrl' value={dest} />;
    }

    if (this.props.ctx.query.error) {
      switch (this.props.error) {
        case 'EMAIL_NEWSLETTER':
          emailClass = 'has-error';
          message = 'Please enter an email if you wish to sign up to the newsletter.';
          break;
        case 'PASSWORD_MATCH':
          passwordClass = 'has-error';
          message = 'Passwords do not match.';
          break;
        case 'USERNAME_TAKEN':
          usernameClass = 'has-error';
          message = 'Your username has already been taken.'
          break;
        default:
          message = 'An error occured.';
          break;

      }

      errorClass = 'alert alert-danger alert-bar';
    }

    return (
      <main>
        <div className={ errorClass } role='alert'>
          { message }
        </div>

        <div className='container'>
          <div className='row'>
            <div className='col-xs-12 col-sm-6 LoginPage'>

              <h1 className='title h4'>Create a New Account</h1>

              <form action='/register' method='POST'>
                <div className={ usernameClass + ' form-group LoginPage-zoom-holder' }>
                  <label htmlFor='username' className='hidden'>Username</label>
                  <input id='username' className='form-control zoom-fix' name='username' type='text' placeholder='Choose a username' required='required' />
                </div>

                <div className={ passwordClass + ' form-group LoginPage-zoom-holder' }>
                  <label htmlFor='password' className='hidden'>Password</label>
                  <input id='password' className='form-control zoom-fix' name='password' type='password' placeholder='Password' required='required' />
                </div>

                <div className={ passwordClass + ' form-group LoginPage-zoom-holder' }>
                  <label htmlFor='password2' className='hidden'>Verify password</label>
                  <input id='password2' className='form-control zoom-fix' name='password2' type='password' placeholder='Verify password' required='required' />
                </div>

                <div className={ emailClass + ' form-group LoginPage-zoom-holder' }>
                  <label htmlFor='email' className='hidden'>Email (optional)</label>
                  <input id='email' className='form-control zoom-fix' name='email' type='email' placeholder='Email (optional)' />
                </div>

                <div className='checkbox'>
                  <label>
                    <input type='checkbox' name='newsletter' /> Subscribe to newsletter
                  </label>
                </div>

                { refererTag }

                <input type='hidden' value={ this.props.ctx.csrf } name='_csrf' />

                <button type='submit' className='btn-post btn-block'>Create Account</button>
              </form>

              <p>
                <a href={'/login' + linkDest } data-no-route='true'>Already have an account? Log in!</a>
              </p>
            </div>
          </div>

          <div className='text-muted text-small'>
            We care about your privacy, and we never spam. By creating an
            account, you agree to reddit's
            <a href='http://reddit.com/help/useragreement' className='text-link'> User Agreement </a>
            and
            <a href='http://reddit.com/help/privacypolicy' className='text-link'> Privacy Policy</a>.
            We're proud of them, and you should read them.
          </div>
        </div>
      </main>
    );
  }
};

export default RegisterPage;
