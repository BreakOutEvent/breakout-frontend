import React from 'react';
import { Button } from '@material-ui/core';
import PropTypes from 'prop-types';

class ListOfSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {error: null};
  }

  redirectToReferrer() {
      window.location = '/';
  }

  deleteTeamProfile(teamId)  {
      console.log(teamId);

    this.props.api.deleteTeam(this.props.teamId)
      .then(data => {
        this.redirectToReferrer();
      })
      .catch(error => this.setState({error}));
  }

  render() {
    const i18next = this.props.i18next;
    if (this.state.error) {
      return <div className="alert alert-warning">Something went wrong when loading settings.</div>;
    }

    return <div>
         <Button id='deleteTeamProfile'
        onClick={() => this.deleteTeamProfile(this.props.teamId)}
                  className="btn btn-primary">
            {i18next.t('client.team_settings.delete_team')}
          </Button>
    </div>;
  }
}

ListOfSettings.propTypes = {
  api: PropTypes.object.isRequired,
  teamId: PropTypes.number,
  i18next: PropTypes.object.isRequired,
};

export default ListOfSettings;
