import React from 'react';
import _ from 'lodash';

const SponsorPresentation = (props) => {

  const style = {
    bottom: {
      fontSize: 'small',
        backgroundColor: '#F5F5F5',
        padding: '10px 0 10px 10px',
        height: 50,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
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

  const name = `${(props.firstname ? props.firstname : '')}${(props.lastname ? ` ${props.lastname}` :'')}`;

  const company = props.url
    ? <a href={props.url}>{props.company}</a>
    : props.company;

  return <div style={style.bottom}>
    <div style={style.sponsor}>
      {name}<br/>
      {company}
    </div>
    <div style={style.logo}>
      <img src={props.logoUrl} style={style.image}/>
    </div>
  </div>;
};

export default SponsorPresentation;
