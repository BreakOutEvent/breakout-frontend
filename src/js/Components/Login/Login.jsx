import React from 'react';
import LoginForm from './LoginForm.jsx';
import {storeTokens, isUserLoggedIn} from '../helpers';

export default class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loginError: null,
      isSubmitting: false
    };
  }

  componentWillMount() {
    if (isUserLoggedIn()) {
      this.props.history.push('/r/select-role');
    }
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

    let tokens;
    try {
      tokens = await this.props.api.login(email, pw);
    } catch (err) {
      this.onLoginError(err);
      this.onEndSubmit();
      return Promise.resolve();
    }

    try {
      await this.props.api.frontendLogin(email, pw);
      this.onEndSubmit();
      this.onLoginSuccess(tokens);
    } catch (err) {
      this.onEndSubmit();
      this.onLoginError(err);
    }
  }

  onLoginSuccess(tokens) {
    storeTokens(tokens);
    this.props.api.setAccessToken(tokens);
    this.props.history.push('/r/select-role');
  }

  onLoginError(err) {
    let message = err.message;
    if (err.response && err.response.status === 400) {
      message = this.props.i18next.t('client.login.error_login');
    }
    this.setState({
      loginError: message
    });
  }

  render() {
    return (
      <LoginForm i18next={this.props.i18next}
                 onSubmit={this.onSubmit.bind(this)}
                 loginError={this.state.loginError}
                 isSubmitting={this.state.isSubmitting}
                 onRegister={() => this.props.history.push('/r/register')}
                 onPasswordReset={() => this.props.history.push('/r/reset-password')}
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
};