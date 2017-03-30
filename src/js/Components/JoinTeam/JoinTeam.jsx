import React from 'react';
import JoinTeamForm from './JoinTeamForm.jsx';

export default class JoinTeam extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      joinTeamError: null,
      invitations: [],
      isSubmitting: false,
      isLoadingInvitations: true
    };
  }

  async componentDidMount() {
    try {
      let invitations = await this.props.api.getAllInvitations();
      invitations = invitations.filter(invitation => invitation.team.members.length >= 1);
      this.setState({
        invitations: invitations,
        isLoadingInvitations: false
      });
    } catch (err) {
      this.onLoadingInvitationsError(err);
    }
  }

  onLoadingInvitationsError(err) {
    throw err;
  }

  onBeginSubmit() {
    this.setState({
      isSubmitting: true
    });
  }

  onEndSubmit() {
    this.setState({
      isSubmitting: true
    });
  }

  async onSubmit(data) {
    this.onBeginSubmit();
    await this.onSubmitImpl(data);
    this.onEndSubmit();
  }

  onSubmitImpl(data) {
    const selectedTeamId = data.formData.selectedTeam;
    return this.props.api.joinTeam(selectedTeamId)
      .then(this.onJoinSuccess.bind(this))
      .catch(this.onJoinError.bind(this));
  }

  onJoinSuccess() {
    this.props.history.push('/r/join-team-success');
  }

  onJoinError(error) {
    const message = this.parseError(error);
    this.setState({
      joinTeamError: message
    });
  }

  parseError(error) {
    try {
      const message = error.response.data.message;
      return message;
    } catch (err) {
      return error.message;
    }
  }


  render() {
    if (this.state.isLoadingInvitations) {
      return (
        <div className="alert alert-info">{this.props.i18next.t('client.join_team.loading')}</div>
      );
    } else {
      return (
        <JoinTeamForm i18next={this.props.i18next}
                      onSubmit={this.onSubmit.bind(this)}
                      teamCreationError={this.state.joinTeamError}
                      invitations={this.state.invitations}
                      joinTeamError={this.state.joinTeamError}
                      isSubmitting={this.state.isSubmitting}
                      onError={() => {
                      }}
                      onChange={() => {
                      }}/>
      );
    }

  }
}

JoinTeam.propTypes = {
  api: React.PropTypes.object.isRequired,
  i18next: React.PropTypes.object.isRequired
};