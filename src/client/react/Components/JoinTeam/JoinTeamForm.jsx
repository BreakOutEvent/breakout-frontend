import Form from '../Form.jsx';
import React from 'react';
import InvitationWidget from './InvitationWidget.jsx';
import Button from '../Button.jsx';
import PropTypes from 'prop-types';
export default class JoinTeamForm extends React.Component {

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
      description: i18next.t('client.join_team.description'),
      required: ['selectedTeam'],
      properties: {
        selectedTeam: {
          type: 'string',
          title: i18next.t('client.create_or_join_team.select_team_to_join'),
          enumNames: this.props.invitations,
          enum: this.props.invitations.map(inv => inv.team.id.toString())
        },
      }
    };

    const uiSchema = {
      selectedTeam: {
        'ui:widget': InvitationWidget
      }
    };

    if (this.props.invitations.length > 0) {
      return (

        <Form schema={schema}
              uiSchema={uiSchema}
              showErrorList={false}
              transformErrors={this.transformErrors}
              noValidate={false}
              onChange={this.props.onChange}
              onSubmit={this.props.onSubmit}
              onError={this.props.onChange}>

          { this.props.joinTeamError &&
          <div className="alert alert-danger">
            {this.props.joinTeamError}
          </div>
          }
          <Button id='register'
                  className="btn btn-primary"
                  type="submit"
                  isLoading={this.props.isSubmitting}>
            {i18next.t('client.create_or_join_team.button_join_text')}
          </Button>
        </Form>
      );
    } else {
      return (
        <div className="alert alert-info">{i18next.t('client.create_or_join_team.no_invitations')}</div>
      );
    }
  }
}

JoinTeamForm.propTypes = {
  invitations: PropTypes.array.isRequired,
  i18next: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  joinTeamError: PropTypes.string,
  isSubmitting: PropTypes.bool.isRequired
};