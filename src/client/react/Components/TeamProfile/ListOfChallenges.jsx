import React from 'react';
import {Icon, Paper} from '@material-ui/core';
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
  const icons = {
    'WITH_PROOF': 'check',
    'PROPOSED': 'notifications',
    'ACCEPTED': ''
  };
  const iconColors = {
    'WITH_PROOF': 'green',
    'PROPOSED': 'grey',
    'ACCEPTED': 'black'
  };
  const color = (props.status === 'WITH_PROOF') ? ' green' : 'black';

  const style = styleChallenge(color);

  const name = `${props.sponsor.firstname} ${props.sponsor.lastname}`;
  const company = props.sponsor.url
    ? <a href={props.sponsor.url}>{props.sponsor.company}</a>
    : props.sponsor.url;

  return (
    <Paper>
      <div style={style.top}>
        <div style={style.icon}>
          {props.amount}€
          <Icon style={{'color': iconColors[props.status]}}>{icons[props.status]}</Icon>
        </div>
        <div style={style.description}>{props.description}</div>
      </div>
      <div style={style.bottom}>
        <div style={style.sponsor}>
          {name}<br/>
          {company}
        </div>
        <div style={style.logo}>
          <img src={url} style={style.image}/>
        </div>
      </div>
    </Paper>
  );
};

export default ListOfChallenges;