import React from 'react';
import TeamCreationForm from './TeamCreationForm.jsx';

export default class TeamCreation extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      teamCreationError: null,
      events: []
    };
  }

  componentDidMount() {
    // TODO: Redirect if user is no participant
    this.props.api.getAllEvents()
      .then(events => this.setState({events: events}))
      .catch(this.onGetAllEventsError.bind(this));
  }

  onGetAllEventsError(error) {
    // TODO: Handle error
    console.error(error);
  }

  async onSubmit(data) {

    const eventId = this.state.events
      .filter(event => event.title === data.formData.city)[0].id;

    const teamData = {
      name: data.formData.teamname,
      description: data.formData.description
    };

    let team;
    try {
      team = await this.props.api.createTeam(eventId, teamData);
    } catch (err) {
      this.onCreateTeamError(err);
      return Promise.resolve();
    }

    console.log(team);

    try {
      await this.props.api.inviteToTeam(team.id, data.formData.partneremail);
      // TODO: Redirect
    } catch (err) {
      this.onInviteToTeamError(err);
    }
  }

  onCreateTeamSuccess(data) {
    // TODO: Redirect
    console.log(data);
    return data;
  }

  onCreateTeamError(error) {

    let message = '';
    try {
      message = error.response.data.message;
      if (message === 'A participant can\'t join more than one team at the same event') {
        message = this.props.i18next.t('client.create_team.participant_already_has_team_for_event');
      }
    } catch (err) {
      message = error.message;
    }

    this.setState({
      teamCreationError: message
    });
  }

  onInviteToTeamError(error) {
    let message = '';

    try {
      message = error.response.data.message;
      if (message.substring(0, 'Invalid email'.length) === 'Invalid email') {
        message = this.props.i18next.t('client.create_team.invalid_invite_email');
      }
    } catch (err) {
      message = error.message;
    }
    this.setState({
      teamCreationError: message
    });
  }

  render() {
    return (
      <TeamCreationForm i18next={this.props.i18next}
                        onSubmit={this.onSubmit.bind(this)}
                        teamCreationError={this.state.teamCreationError}
                        events={this.state.events}
                        onError={() => {
                        }}
                        onChange={() => {
                        }}/>
    );
  }
}