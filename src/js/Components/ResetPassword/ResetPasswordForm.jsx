import Form from '../Form.jsx';
import React from 'react';
import Button from '../Button.jsx';

export default class ResetPasswordForm extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {

    const i18next = this.props.i18next;

    const schema = {
      type: 'object',
      description: i18next.t('client.reset_password.description'),
      title: i18next.t('client.reset_password.headline'),
      required: ['email'],
      properties: {
        email: {
          type: 'string',
          title: i18next.t('client.reset_password.email_label'),
        },
      }
    };

    const uiSchema = {
      email: {
        'ui:widget': 'email'
      }
    };

    return (

      <Form schema={schema}
            uiSchema={uiSchema}
            showErrorList={false}
            onChange={this.props.onChange}
            onSubmit={this.props.onSubmit}
            onError={this.props.onError}>

        <span className="fullwidth-center">
        { this.props.resetPasswordError &&
        <div className="alert alert-danger">
          {this.props.resetPasswordError}
        </div>
        }
        </span>

        <span className="fullwidth-center">
        <Button id='resetpassword-btn'
                className="btn btn-primary"
                isLoading={this.props.isSubmitting}
                type="submit">
          {i18next.t('client.reset_password.reset_password_button')}
          </Button>
        </span>
      </Form>
    );
  }
}

ResetPasswordForm.propTypes = {
  i18next: React.PropTypes.object.isRequired,
  onChange: React.PropTypes.func.isRequired,
  onSubmit: React.PropTypes.func.isRequired,
  onError: React.PropTypes.func.isRequired,
  resetPasswordError: React.PropTypes.string,
  resetPasswordSuccess: React.PropTypes.string,
  isSubmitting: React.PropTypes.bool.isRequired
};
