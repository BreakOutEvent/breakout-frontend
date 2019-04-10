import React from 'react';
import {Icon, Paper} from '@material-ui/core';
import SponsorPresentation from './SponsorPresentation.jsx';
import _ from 'lodash';

export const styleChallenge = color => ({
  top: {
    display: 'flex',
    borderBottom: '1px solid #cbcbcb',
    padding: 10,
    alignItems: 'center',
    minHeight: 80
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
  bottom: {
    fontSize: 'small',
    backgroundColor: '#F5F5F5',
    padding: 10,
    height: 50,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  sponsor: {
    flexBasis: '60%'
  },
  logo: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexGrow: 2
  },
  image: {
    maxHeight: '50px',
    maxWidth: '100%',
    objectFit: 'contain'
  }
});

const ListOfChallenges = (props) => {

  const renderChallenge = (challenge) => (
    <div key={challenge.id} style={{marginBottom: 20}}><ChallengeListItem {...challenge} /></div>
  );

  // Todo only display proposed challenges of the logged in user
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

  var counterDescription;
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
