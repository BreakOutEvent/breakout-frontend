import Form from 'react-jsonschema-form';
import React from 'react';

export default class ParticipationForm extends React.Component {

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
      title: i18next.t('client.participate.title'),
      required: ['gender', 'firstname', 'lastname', 'tshirtSize', 'phonenumber', 'emergencynumber',
        'acceptToS', 'acceptCoH', 'is18'],
      properties: {
        gender: {
          type: 'string',
          title: i18next.t('client.participate.gender'),
          enumNames: [i18next.t('client.participate.male'), i18next.t('client.participate.female')],
          enum: ['male', 'female']
        },
        firstname: {
          type: 'string',
          title: i18next.t('client.participate.firstname.label')
        },
        lastname: {
          type: 'string',
          title: i18next.t('client.participate.lastname.label')
        },
        tshirtSize: {
          type: 'string',
          title: i18next.t('client.participate.tshirtsize.label'),
          enum: ['S', 'M', 'L', 'XL']
        },
        phonenumber: {
          type: 'string',
          title: i18next.t('client.participate.contactnumber.label')
        },
        emergencynumber: {
          type: 'string',
          title: i18next.t('client.participate.emergencynumber.label')
        },
        acceptToS: {
          type: 'boolean',
          title: i18next.t('client.participate.accept_tos')
        },
        acceptCoH: {
          type: 'boolean',
          title: i18next.t('client.participate.accept_code_of_honour')
        },
        is18: {
          type: 'boolean',
          title: i18next.t('client.participate.is_18')
        }
      }
    };

    const uiSchema = {
      gender: {
        'ui:widget': 'radio',
        'ui:options': {
          inline: true
        },
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

        { this.props.participationError &&
        <div className="alert alert-danger">
          {this.props.participationError}
        </div>
        }
        <button id='register' className="btn btn-primary"
                type="submit">{i18next.t('client.participate.next_step')}</button>
      </Form>
    );
  }
}