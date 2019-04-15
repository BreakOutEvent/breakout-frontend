import React from 'react';
import { Paper } from '@material-ui/core';
import PropTypes from 'prop-types';

import SponsorPresentation from './SponsorPresentation.jsx';
import AddSponsoring from './AddSponsoring.jsx';

class ListOfSponsors extends React.Component {
  constructor(props) {
    super(props);
    this.state = {challenges: [], error: null};
    this.update = this.update.bind(this);
  }

  componentDidMount() {
    this.props.api.fetchSponsoringsForTeam(this.props.teamId)
      .then(sponsorings => {this.setState({
        sponsors: sponsorings.sort((a,b)=>b.id-a.id)}
      )})
      .catch(error => this.setState({error}));
  }

  update(sponsorId) {
    this.props.api.fetchSponsoringsForTeam(this.props.teamId)
      .then(sponsors => {
        let sortedByNewest = sponsors.sort((a,b)=>b.id-a.id);
        let sortedByNewestAndUser = sortedByNewest.filter(sponsor=>sponsor.sponsor.sponsorId===sponsorId);
        let allChallengesFromOthers = sortedByNewest.filter(sponsor=>sponsor.sponsor.sponsorId!==sponsorId);
        sortedByNewestAndUser.push(...allChallengesFromOthers);
        this.setState({
          sponsors: sortedByNewestAndUser
        });
      })
      .catch(error => this.setState({error}));
  }


  render() {
    if (this.state.error) {
      return <div className="alert alert-warning">Something went wrong when loading sponsorings</div>;
    }

    let key = 0;
    const renderSponsor = (sponsoring) => {
      return <Paper key={key++} style={{marginBottom: 20}}><SponsorPresentation {...sponsoring.sponsor} /></Paper>
    };

    const sponsors = this.state.sponsors && this.state.sponsors
      .filter(sponsoring => (sponsoring.status === 'ACCEPTED'))
      .map(renderSponsor);

    return <div>
      <AddSponsoring {...this.props} update={this.update} />
      {sponsors && sponsors}
    </div>;
  }
}

ListOfSponsors.propTypes = {
  api: PropTypes.object.isRequired,
  teamId: PropTypes.number,
  i18next: PropTypes.object.isRequired,
};

export default ListOfSponsors;
