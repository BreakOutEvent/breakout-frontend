import Form from '../Form.jsx';
import React from 'react';
import Button from '../Button.jsx';

export default class TeamCreationForm extends React.Component {

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
      description: i18next.t('client.create_team.description'),
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
      partneremail: {
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
            onChange={this.props.onChange}
            onSubmit={this.props.onSubmit}
            onError={this.props.onError}>

        { this.props.teamCreationError &&
        <div className="alert alert-danger">
          {this.props.teamCreationError}
        </div>
        }
        <Button id='register'
                className="btn btn-primary"
                isLoading={this.props.isSubmitting}
                type="submit">
          {i18next.t('client.create_or_join_team.button_create_text')}
        </Button>
      </Form>
    );
  }
}

TeamCreationForm.propTypes = {
  i18next: React.PropTypes.object.isRequired,
  events: React.PropTypes.array.isRequired,
  onChange: React.PropTypes.func.isRequired,
  onSubmit: React.PropTypes.func.isRequired,
  onError: React.PropTypes.func.isRequired,
  teamCreationError: React.PropTypes.string,
  isSubmitting: React.PropTypes.bool.isRequired
};