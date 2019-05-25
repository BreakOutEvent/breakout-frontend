import React from 'react';
import TeamCreationForm from './TeamCreationForm.jsx';
import routes from '../routes';
import PropTypes from 'prop-types';

export default class TeamCreation extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      teamCreationError: null,
      isSubmitting: false,
      events: []
    };
  }

  async componentDidMount() {
    const isParticipant = await this.props.api.isUserParticipant();

    if (!isParticipant) {
      this.props.show('participate');
    } else {
      this.props.api.getAllOpenEvents()
        .then(events => this.setState({ events }))
        .catch(this.onGetAllEventsError.bind(this));
    }
  }

  onGetAllEventsError(error) {
    // TODO: Handle error
    console.error(error);
  }

  onStartSubmit() {
    this.setState({
      isSubmitting: true,
      teamCreationError: null
    });
  }

  onEndSubmit() {
    this.setState({isSubmitting: false});
  }

  async onSubmit(data) {
    this.onStartSubmit();
    await this.onSubmitImpl(data);
    this.onEndSubmit();
  }

  async onSubmitImpl(data) {

    const eventId = this.state.events
      .filter(event => event.title === data.formData.city)[0].id;

    const teamData = {
      name: data.formData.teamname,
      description: data.formData.teamdescription
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
      this.onCreateTeamSuccess();
    } catch (err) {
      this.onInviteToTeamError(err);
    }
  }

  onCreateTeamSuccess() {
    this.props.history.push(routes.createTeamSuccess);
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
                        isSubmitting={this.state.isSubmitting}
                        onError={() => {
                        }}
                        onChange={() => {
                        }}/>
    );
  }
}

TeamCreation.propTypes = {
  i18next: PropTypes.object.isRequired,
  api: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};