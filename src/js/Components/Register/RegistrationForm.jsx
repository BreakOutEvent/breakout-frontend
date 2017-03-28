import Form from '../Form.jsx';
import React from 'react';
import Button from '../Button.jsx';

export default class LoginForm extends React.Component {

  constructor(props) {
    super(props);
  }

  transformErrors(errors) {
    const i18next = this.props.i18next;
    return errors.map(error => {
      if (error.property === 'instance.password') {
        error.message = i18next.t('client.registration.under_min_pw_length');
      }

      return error;
    });
  }

  validate(formData, errors) {
    const i18next = this.props.i18next;
    if (formData.password1 !== formData.password2) {
      errors.password2.addError(i18next.t('client.registration.passwords_dont_match'));
    }

    return errors;
  }

  render() {

    const i18next = this.props.i18next;

    const schema = {
      type: 'object',
      title: i18next.t('client.login.button_registration_headline'),
      description: i18next.t('client.register.description'),
      required: ['email', 'password1', 'password2'],
      properties: {
        email: {
          type: 'string',
          title: i18next.t('client.login.email_label'),
          default: ''
        },
        password1: {
          type: 'string',
          title: i18next.t('client.login.password_label'),
          minLength: 3
        },
        password2: {
          type: 'string',
          title: i18next.t('client.login.repeat_password_label'),
          minLength: 3
        }
      }
    };

    const uiSchema = {
      email: {
        'ui:widget': 'email'
      },
      password1: {
        'ui:widget': 'password',
      },
      password2: {
        'ui:widget': 'password',
      }
    };

    return (
      <Form schema={schema}
            uiSchema={uiSchema}
            showErrorList={false}
            transformErrors={this.transformErrors.bind(this)}
            validate={this.validate.bind(this)}
            onChange={this.props.onChange}
            onSubmit={this.props.onSubmit}
            onError={this.props.onError}>

        { this.props.registrationError &&
        <div className="alert alert-danger">
          {this.props.registrationError}
        </div>
        }

        <Button id='register'
                className="btn btn-primary"
                type="submit"
                isLoading={this.props.isSubmitting}>
          {i18next.t('client.register.button')}
        </Button>
      </Form>
    );
  }
}

LoginForm.propTypes = {
  i18next: React.PropTypes.object.isRequired,
  onChange: React.PropTypes.func.isRequired,
  onSubmit: React.PropTypes.func.isRequired,
  onError: React.PropTypes.func.isRequired,
  registrationError: React.PropTypes.string,
  isSubmitting: React.PropTypes.bool.isRequired
};
