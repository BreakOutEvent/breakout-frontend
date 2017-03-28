import React from 'react';
import LoginForm from './LoginForm.jsx';
import {storeTokens} from '../helpers';

export default class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loginError: null,
      isSubmitting: false
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
    this.onEndSubmit();
  }

  async onSubmitImpl(data) {
    const email = data.formData.email;
    const pw = data.formData.password;

    let tokens;
    try {
      tokens = await this.props.api.login(email, pw);
    } catch (err) {
      this.onLoginError(err);
      return Promise.resolve();
    }

    try {
      await this.props.api.frontendLogin(email, pw);
      this.onLoginSuccess(tokens);
    } catch (err) {
      this.onLoginError(err);
    }
  }

  onLoginSuccess(tokens) {
    storeTokens(tokens);
    this.props.history.push('/r/select-role');
  }

  onLoginError(err) {
    this.setState({
      loginError: err.message
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