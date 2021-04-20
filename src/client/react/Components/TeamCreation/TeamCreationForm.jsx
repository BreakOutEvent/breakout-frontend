import Form from '../Form.jsx';
import React from 'react';
import Button from '../Button.jsx';
import PropTypes from 'prop-types';

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
      description: i18next.t('client.create_team.description'),
      required: ['city', 'teamname', 'teamdescription', 'partneremail', 'postaddress'],
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
        },
        postaddress: {
          type: 'string',
          title: i18next.t('client.create_or_join_team.postaddress.label'),
        }
      }
    };

    const uiSchema = {
      partneremail: {
        'ui:widget': 'email'
      },
      teamdescription: {
        'ui:widget': 'textarea'
      },
      postaddress: {
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
  i18next: PropTypes.object.isRequired,
  events: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  teamCreationError: PropTypes.string,
  isSubmitting: PropTypes.bool.isRequired
};