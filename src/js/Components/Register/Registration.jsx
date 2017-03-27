import React from 'react';
import RegistrationForm from './RegistrationForm.jsx';

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

  onSubmitImpl(data) {
    const email = data.formData.email;
    const pw = data.formData.password1;

    return this.props.api.createAccount(email, pw)
      .then(this.onRegistrationSuccess.bind(this))
      .catch(this.onRegistrationError.bind(this));
  }

  onRegistrationSuccess(data) {
    this.props.show('selectRole');
  }

  onRegistrationError(error) {
    this.setState({
      registrationError: error.message
    });
  }

  render() {
    return (
      <RegistrationForm i18next={this.props.i18next}
                        onSubmit={this.onSubmit.bind(this)}
                        isSubmitting={this.state.isSubmitting}
                        registrationError={this.state.registrationError}
                        onError={() => {
                        }}
                        onChange={() => {
                        }}/>
    );
  }
}