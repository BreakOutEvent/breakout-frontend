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

  onSubmit(data) {
    const email = data.formData.email;
    const pw = data.formData.password;

    this.props.api.login(email, pw)
      .then(this.onLoginSuccess.bind(this))
      .catch(this.onLoginError.bind(this));
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