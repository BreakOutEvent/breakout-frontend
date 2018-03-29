import React from 'react';
import JoinTeamForm from './JoinTeamForm.jsx';
import routes from '../routes';

export default class JoinTeam extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      joinTeamError: null,
      isSubmitting: false
    };
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
    this.props.history.push(routes.joinTeamSuccess);
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
    return (
      <JoinTeamForm i18next={this.props.i18next}
                    onSubmit={this.onSubmit.bind(this)}
                    teamCreationError={this.state.joinTeamError}
                    invitations={this.props.invitations}
                    joinTeamError={this.state.joinTeamError}
                    isSubmitting={this.state.isSubmitting}
                    onError={() => {
                    }}
                    onChange={() => {
                    }}/>
    );
  }
}

JoinTeam.propTypes = {
  api: React.PropTypes.object.isRequired,
  i18next: React.PropTypes.object.isRequired,
  history: React.PropTypes.object.isRequired,
  invitations: React.PropTypes.object.isRequired
};