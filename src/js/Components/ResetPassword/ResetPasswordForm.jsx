import Form from '../Form.jsx';
import React from 'react';

export default class ResetPasswordForm extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {

    const i18next = this.props.i18next;

    const schema = {
      type: 'object',
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

    const style = {width: '100%', display: 'flex', justifyContent: 'center'};

    return (

      <Form schema={schema}
            uiSchema={uiSchema}
            showErrorList={false}
            onChange={this.props.onChange}
            onSubmit={this.props.onSubmit}
            onError={this.props.onError}>

        <span style={style}>
        { this.props.resetPasswordError &&
        <div className="alert alert-danger">
          {this.props.resetPasswordError}
        </div>
        }
        </span>

        <span style={style}>
        { this.props.resetPasswordSuccess &&
        <div className="alert alert-success">
          {this.props.resetPasswordSuccess}
        </div>
        }
        </span>

        <span style={style}>
        <button id='resetpassword-btn'
                className="btn btn-primary"
                type="submit">
          {i18next.t('client.reset_password.reset_password_button')}
          </button>
        </span>
      </Form>
    );
  }
}