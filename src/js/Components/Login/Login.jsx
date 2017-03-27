import React from 'react';
import LoginForm from './LoginForm.jsx';
import {storeTokens} from '../helpers';

export default class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loginError: null
    };
  }

  async onSubmit(data) {
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
    this.props.show('selectRole');
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
                 onRegister={() => this.props.show('register')}
                 onPasswordReset={() => this.props.show('resetPassword')}
                 onError={() => {
                 }}
                 onChange={() => {
                 }}/>
    );
  }
}