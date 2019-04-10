import React from 'react';
import _ from 'lodash';
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

const ChallengeListItem = (props) => {
  const url = _.get(props, 'sponsor.logoUrl', '');
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

  return (
    <Paper>
      <div style={style.top}>
        <div style={style.icon}>
          {props.amount}€
          {(props.status === 'WITH_PROOF') && <Icon style={{color}}>check</Icon>}
        </div>
        <div style={style.description}>{props.description} {counterDescription}</div>
      </div>
      <SponsorPresentation {...props.sponsor} />
    </Paper>
  );
};

export default ListOfChallenges;
