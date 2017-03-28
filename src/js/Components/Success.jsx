import React from 'react';

const Success = (props) => {
  return (
    <div>
      <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
        <img src="/img/logo.svg"
             className="img-responsive"
             style={{maxWidth: '125px', marginTop: '-34px'}}/>
      </div>
      <h3 style={{textAlign: 'center'}}>
        {props.title}
      </h3>
      <p>{props.description}</p>
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        marginTop: '20px',
        marginBottom: '20px'
      }}>
        <a href="/">
          <div className="btn btn-primary">{props.button}</div>
        </a>
      </div>
    </div>
  );
};

const VisitorSuccess = (props) => {
  return <Success title={props.i18next.t('SPECTATOR-SUCCESS.HEADLINE')}
                  description={props.i18next.t('SPECTATOR-SUCCESS.DESCRIPTION')}
                  button={props.i18next.t('SPECTATOR-SUCCESS.LINK_DESCRIPTION')}/>;
};

export {Success, VisitorSuccess};