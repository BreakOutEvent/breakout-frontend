import Form from 'react-jsonschema-form';
import React from 'react';

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
        type: 'object',
        properties: {
          email: {
            'ui:widget': 'email'
          }
        }
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
            onChange={() => {
            }}
            onSubmit={(data) => {
              console.log(data);
            }}
            onError={() => {
            }}>
        <button id='register' className="btn btn-primary"
                type="submit">{i18next.t('client.login.button_register_text')}</button>
      </Form>
    );
  }
}