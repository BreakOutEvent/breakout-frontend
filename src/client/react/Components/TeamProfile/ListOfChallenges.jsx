import React from 'react';
import {FontIcon, Paper} from 'material-ui';
import _ from 'lodash';

const ListOfChallenges = (props) => {

  const renderChallenge = (challenge) => (
    <div style={{marginBottom: 20}}><ChallengeListItem {...challenge} /></div>
  );
  const challenges = props.challenges
    .filter(challenge => challenge.status === 'WITH_PROOF' || challenge.status === 'PROPOSED')
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
  const icon = (props.status === 'WITH_PROOF') ? 'check' : '';

  const style = {
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
  };

  const name = `${props.sponsor.firstname} ${props.sponsor.lastname}`;
  const company = props.sponsor.url
    ? <a href={props.sponsor.url}>{props.sponsor.company}</a>
    : props.sponsor.url;

  var counterDescription;
  switch (props.maximumCount) {
      case 1:
          counterDescription = '';
      case undefined:
          counterDescription = `${props.fulfilledCount}/∞`;
      default:
          counterDescription = `${props.fulfilledCount}/${props.maximumCount}`;
  }

  return (
    <Paper zDepth={1}>
      <div style={style.top}>
        <div style={style.icon}>
          {props.amount}€
          <FontIcon className='material-icons' style={{color}}>{icon}</FontIcon>
        </div>
        <div style={style.description}>{props.description} {counterDescription}</div>
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