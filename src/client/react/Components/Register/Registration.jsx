import React from 'react';
import RegistrationForm from './RegistrationForm.jsx';
import routes from '../routes';
import PropTypes from 'prop-types';

export default class Registration extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      registrationError: null,
      isSubmitting: false
    };
  }

  async onSubmit(data) {
    this.onBeginSubmit();
    await this.onSubmitImpl(data);
    this.onEndSubmit();
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
      window.location = routes.selectRole;
    }
  }

  async onSubmitImpl(data) {
    const email = data.formData.email;
    const pw = data.formData.password1;
    let account;
    try {
      account = await this.props.api.createAccount(email, pw);
      await this.props.api.login(email, pw);
      await this.props.api.frontendLogin(email, pw);
    } catch (err) {
      this.onRegistrationError(err);
      return;
    }

    try {
      await this.props.api.updateUserData(account.id, {
        preferredLanguage: window.boUserLang
      });
      this.onRegistrationSuccess();
    } catch (err) {
      console.warn('Failed to set preferredLanguage: ' + err.message);
      this.onRegistrationSuccess();
    }
  }

  onRegistrationSuccess() {
    this.redirectToReferrer();
  }

  onRegistrationError(error) {
    let message = error.message;
    if (error.response && error.response.status === 409) {
      message = this.props.i18next.t('client.login.registration_error_exists');
    }
    this.setState({
      registrationError: message
    });
  }

  render() {
    return (
      <RegistrationForm i18next={this.props.i18next}
                        onSubmit={this.onSubmit.bind(this)}
                        isSubmitting={this.state.isSubmitting}
                        registrationError={this.state.registrationError}
                        history={this.props.history}
                        onError={() => {
                        }}
                        onChange={() => {
                        }}/>
    );
  }
}

Registration.propTypes = {
  api: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  i18next: PropTypes.object.isRequired,
};