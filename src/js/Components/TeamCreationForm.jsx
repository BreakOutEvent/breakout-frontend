import Form from 'react-jsonschema-form';
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
      title: i18next.t('client.create_team.title'),
      required: ['city', 'teamname', 'teamdescription', 'partneremail'],
      properties: {
        city: {
          type: 'string',
          title: i18next.t('client.create_or_join_team.select_event'),
          enum: this.props.events.map(event => event.title)
        },
        teamname: {
          type: 'string',
          title: i18next.t('client.create_or_join_team.team_name.label'),
        },
        teamdescription: {
          type: 'string',
          title: i18next.t('client.create_or_join_team.team_description.label'),
        },
        partneremail: {
          type: 'string',
          title: i18next.t('client.create_or_join_team.partner_email.label'),
        }
      }
    };

    const uiSchema = {
      email: {
        'ui:widget': 'email'
      },
      teamdescription: {
        'ui:widget': 'textarea'
      }
    };

    return (
      <Form schema={schema}
            uiSchema={uiSchema}
            showErrorList={false}
            transformErrors={this.transformErrors}
            onChange={() => {
            }}
            onSubmit={(data) => {
              console.log(data);
            }}
            onError={() => {
            }}>
        <button id='register' className="btn btn-primary"
                type="submit">{i18next.t('client.create_or_join_team.button_create_text')}</button>
      </Form>
    );
  }
}