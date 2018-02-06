import React from 'react';
import LoginForm from './LoginForm.jsx';
import {Redirect} from 'react-router-dom';
import routes from '../routes';

export default class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loginError: null,
      isSubmitting: false,
    };
  }

  onBeginSubmit() {
    this.setState({
      isSubmitting: true
    });
  }

  onEndSubmit() {
    this.setState({
      isSubmitting: false
    });
  }

  async onSubmit(data) {
    this.onBeginSubmit();
    await this.onSubmitImpl(data);
  }

  async onSubmitImpl(data) {
    const email = data.formData.email;
    const pw = data.formData.password;

    try {
      await this.props.api.frontendLogin(email, pw);
      this.onEndSubmit();
      this.onLoginSuccess();
    } catch (err) {
      this.onEndSubmit();
      this.onLoginError(err);
    }
  }

  getQueryValues() {
    let qd = {};
    if (location.search) location.search.substr(1).split('&').forEach(item => {
      let [k, v] = item.split('=');
      v = v && decodeURIComponent(v);
      (qd[k] = qd[k] || []).push(v);
    });

    return qd;
  }

  redirectToReferrer() {
    if (this.getQueryValues().refer) {
      window.location = this.getQueryValues().refer;
    } else {
      window.location = '/';
    }
  }

  onLoginSuccess() {
    this.redirectToReferrer();
  }

  onLoginError(err) {
    let message = err.message;
    if (err.response && err.response.status === 401) {
      message = this.props.i18next.t('client.login.error_login');
    }
    this.setState({
      loginError: message
    });
  }

  render() {
    if (this.props.isLoggedIn) {
      this.redirectToReferrer();
    }

    const registerRoute = routes.register + window.location.search;

    return (
      <LoginForm i18next={this.props.i18next}
                 onSubmit={this.onSubmit.bind(this)}
                 loginError={this.state.loginError}
                 isSubmitting={this.state.isSubmitting}
                 onRegister={() => this.props.history.push(registerRoute)}
                 onPasswordReset={() => this.props.history.push(routes.resetPassword)}
                 onError={() => {
                 }}
                 onChange={() => {
                 }}/>
    );
  }
}

Login.propTypes = {
  history: React.PropTypes.object.isRequired,
  i18next: React.PropTypes.object.isRequired,
  api: React.PropTypes.object.isRequired,
  isLoggedIn: React.PropTypes.bool.isRequired
};