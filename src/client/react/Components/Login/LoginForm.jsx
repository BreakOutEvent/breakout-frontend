import Form from '../Form.jsx';
import React from 'react';
import Button from '../Button.jsx';
import PropTypes from 'prop-types';
export default class LoginForm extends React.Component {

  constructor(props) {
    super(props);
  }

  transformErrors(errors) {
    return errors;
  }

  render() {

    const i18next = this.props.i18next;

    const schema = {
      type: 'object',
      title: i18next.t('client.login.button_login_headline'),
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          title: i18next.t('client.login.email_label'),
        },
        password: {
          type: 'string',
          title: i18next.t('client.login.password_label'),
        }
      }
    };

    const uiSchema = {
      email: {
        'ui:widget': 'email'
      },
      password: {
        'ui:widget': 'password',
      }
    };

    return (

      <Form schema={schema}
            uiSchema={uiSchema}
            showErrorList={false}
            transformErrors={this.transformErrors}
            onChange={this.props.onChange}
            onSubmit={this.props.onSubmit}
            onError={this.props.onError}>

        { this.props.loginError &&
        <div className="alert alert-danger">
          {this.props.loginError}
        </div>
        }

        <button id='password-reset-btn'
                className="btn btn-primary"
                type="button"
                onClick={this.props.onPasswordReset}>
          {i18next.t('client.login.password_reset_text')}
        </button>

        <Button id='login-btn'
                className="btn btn-primary"
                type="submit"
                indicatorColor="#e6823c"
                isLoading={this.props.isSubmitting}>
          {i18next.t('client.login.button_login_text')}
        </Button>

        <button id='register-btn'
                className="btn btn-primary"
                type="button"
                onClick={this.props.onRegister}>
          {i18next.t('client.login.button_register_text')}
        </button>
      </Form>
    );
  }
}

LoginForm.propTypes = {
  i18next: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onPasswordReset: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  loginError: PropTypes.string
};