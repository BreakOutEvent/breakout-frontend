import React from 'react';
import PropTypes from 'prop-types';
import {Icon, Paper} from '@material-ui/core';

import SponsorPresentation from './SponsorPresentation.jsx';

export const styleChallenge = color => ({
  top: {
    display: 'flex',
    borderBottom: '1px solid #cbcbcb',
    alignItems: 'center',
    minHeight: 60,
  },
  icon: {
    marginRight: 20,
    marginLeft: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color
  },
  description: {
    wordBreak: 'break-word',
    color
  },
});

const ListOfChallenges = (props) => {

  const renderChallenge = (challenge) => (
    <div key={challenge.id} style={{marginBottom: 20}}><ChallengeListItem {...challenge} /></div>
  );

  const challenges = props.challenges
    .filter(challenge => challenge.status === 'WITH_PROOF' || challenge.status === 'ACCEPTED' || challenge.status === 'PROPOSED')
    .map(renderChallenge);

  return (
    <div>
      {challenges}
    </div>
  );
};

ListOfChallenges.propTypes = {
  challenges: PropTypes.array,
};

const ChallengeListItem = (props) => {
  const color = (props.status === 'WITH_PROOF') ? ' green' : 'black';
  const style = styleChallenge(color);

  let counterDescription;
  switch (props.maximumCount) {
    case 1:
      counterDescription = '';
      break;
    case undefined:
      counterDescription = `${props.fulfilledCount}/∞`;
      break;
    default:
      counterDescription = `${props.fulfilledCount}/${props.maximumCount}`;
      break;
  }

  const link = (props.status === 'WITH_PROOF') ? { href: `/challenge/${props.id}` } :  {};

  return (
    <Paper>
      <div style={style.top}>
        <div style={style.icon}>
          {props.amount}€
          {(props.status === 'WITH_PROOF') && <Icon style={{color}}>check</Icon>}
        </div>
        <a style={style.description} {...link}>{props.description} {counterDescription}</a>
      </div>
      <SponsorPresentation {...props.sponsor} />
    </Paper>
  );
};

ChallengeListItem.propTypes = {
  sponsor: PropTypes.object.isRequired,
  description: PropTypes.string.isRequired,
  status: PropTypes.string,
  maximumCount: PropTypes.number,
  fulfilledCount: PropTypes.number,
  amount: PropTypes.number.isRequired,
};



export default ListOfChallenges;
