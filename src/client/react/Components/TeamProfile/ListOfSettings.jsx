import React from 'react';
import { Button } from '@material-ui/core';
import PropTypes from 'prop-types';

class ListOfSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {error: null};
    this.deleteTeamProfile = this.deleteTeamProfile.bind(this);
  }


  deleteTeamProfile(teamId) {
    this.props.api.deleteTeamProfile(this.props.teamId)
      .then(sponsors => {
       
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
