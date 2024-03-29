import React from 'react';
import { Button } from '@material-ui/core';
import routes from '../routes';
import PropTypes from 'prop-types';

class ListOfSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }


  deleteTeamProfile(teamId) {
    this.props.api.deleteTeam(this.props.teamId)
      .then(data => {
        window.location.href = routes.teamDeletionSuccess;
      })
      .catch(error => {

        this.setState({ error });
      });
  }

  render() {
    const i18next = this.props.i18next;

    if (!window.boUserData.me || !window.boUserData.me.participant || window.boUserData.me.participant.teamId !== this.props.teamId) {
      return null;
    }

    if (this.state.error) {
      return <div className="alert alert-warning">Something went wrong when loading settings.</div>;
    }

    return <div>
      <h3>{i18next.t('TEAM-DETAIL.SETTINGS')}</h3>
      <Button id='deleteTeamProfile' color="secondary" size="small"
        onClick={() => this.deleteTeamProfile(this.props.teamId)}>
        {i18next.t('client.team_settings.delete_team')}
      </Button>
    </div>;
  }
}

ListOfSettings.propTypes = {
  api: PropTypes.object.isRequired,
  teamId: PropTypes.number,
  i18next: PropTypes.object.isRequired
};

export default ListOfSettings;
