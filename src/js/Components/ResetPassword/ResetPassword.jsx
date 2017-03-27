import React from 'react';
import ResetPasswordForm from './ResetPasswordForm.jsx';

export default class ResetPassword extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      resetPasswordError: null,
      resetPasswordSuccess: null,
      isSubmitting: false
    };
  }

  async onSubmit(data) {
    this.onBeginSubmit();
    await this.onSubmitImpl(data);
    this.onEndSubmit();
  }

  onSubmitImpl(data) {
    const email = data.formData.email;

    return this.props.api.requestPasswordReset(email)
      .then(this.onRequestResetSuccess.bind(this))
      .catch(this.onRequestResetError.bind(this));
  }

  onBeginSubmit() {
    this.setState({
      submitting: true
    });
  }

  onEndSubmit() {
    this.setState({
      submitting: false
    });
  }

  onRequestResetSuccess() {
    this.setState({
      resetPasswordSuccess: this.props.i18next.t('client.reset_password.request_success')
    });
  }

  onRequestResetError(err) {
    // TODO: Parse Error
    this.setState({
      resetPasswordError: err.message
    });
  }

  render() {
    return (
      <ResetPasswordForm i18next={this.props.i18next}
                         resetPasswordError={this.state.resetPasswordError}
                         resetPasswordSuccess={this.state.resetPasswordSuccess}
                         isSubmitting={this.state.isSubmitting}
                         onSubmit={this.onSubmit.bind(this)}
                         onError={() => {
                         }}
                         onChange={() => {
                         }}/>
    );
  }
}