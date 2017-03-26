import Form from '../Form.jsx';
import React from 'react';

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
        type: 'object',
        properties: {
          email: {
            'ui:widget': 'email'
          }
        }
      },
      password: {
        'ui:widget': 'password',
      }
    };

    const style = {width: '100%', display: 'flex', justifyContent: 'center'};
    return (

      <Form schema={schema}
            uiSchema={uiSchema}
            showErrorList={false}
            transformErrors={this.transformErrors}
            onChange={this.props.onChange}
            onSubmit={this.props.onSubmit}
            onError={this.props.onError}>

        <span style={style}>
        { this.props.loginError &&
        <div className="alert alert-danger">
          {this.props.loginError}
        </div>
        }
        </span>

        <span style={style}>
        <button id='password-reset-btn'
                className="btn btn-primary"
                onClick={this.props.onPasswordReset}>
          {i18next.t('client.login.password_reset_text')}</button>
        </span>

        <span style={style}>
        <button id='login-btn'
                className="btn btn-primary"
                type="submit">
          {i18next.t('client.login.button_login_text')}
          </button>
        </span>

        <span style={style}>
        <button id='register-btn'
                className="btn btn-primary"
                onClick={this.props.onRegister}>
          {i18next.t('client.login.button_register_text')}
          </button>
        </span>
      </Form>
    );
  }
}