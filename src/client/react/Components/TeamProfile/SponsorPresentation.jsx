import React from 'react';
import PropTypes from 'prop-types';

const SponsorPresentation = (props) => {
  const sponsorWidth = (props.logoUrl ? '60%' : '100%');
  const style = {
    bottom: {
      fontSize: 'small',
      backgroundColor: '#F5F5F5',
      minHeight: 50,
      padding: '0 0 0 10px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    sponsor: {
      flexBasis: sponsorWidth,
    },
    logo: {
      display: 'flex',
      justifyContent: 'flex-end',
      flexGrow: 2,
      flexBasis: '40%',
    },
    image: {
      maxHeight: '50px',
      maxWidth: '100%',
      objectFit: 'contain'
    }
  };

  const name = `${(props.firstname ? props.firstname : 'Anonym')}${(props.lastname ? ` ${props.lastname}` :'')}`;

  const company = props.url
    ? <a href={props.url}>{props.company}</a>
    : props.company;

  return <div style={style.bottom}>
    <div style={style.sponsor}>
      {name}<br/>
      {company}
    </div>
    {props.logoUrl && <div style={style.logo}>
      <img src={props.logoUrl} style={style.image}/>
    </div>}
  </div>;
};

SponsorPresentation.propTypes = {
  firstname: PropTypes.string,
  lastname: PropTypes.string,
  url: PropTypes.string,
  company: PropTypes.string,
  logoUrl: PropTypes.string,
};

export default SponsorPresentation;
