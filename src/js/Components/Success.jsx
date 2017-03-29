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
        {props.children}
      </div>
    </div>
  );
};

Success.propTypes = {
  title: React.PropTypes.string.isRequired,
  description: React.PropTypes.string.isRequired,
  children: React.PropTypes.any
};

const VisitorSuccess = (props) => {
  return (
    <Success title={props.i18next.t('SPECTATOR-SUCCESS.HEADLINE')}
             description={props.i18next.t('SPECTATOR-SUCCESS.DESCRIPTION')}>
    </Success>);
};

VisitorSuccess.propTypes = {
  i18next: React.PropTypes.object.isRequired
};

const JoinTeamSuccess = (props) => {
  return (
    <Success title="Erfolgreich" description="Team erfolgreich beigetreten">
      <a href="/">
        <div className="btn btn-primary">
          {props.i18next.t('SPECTATOR-SUCCESS.LINK_DESCRIPTION')}
        </div>
      </a>
    </Success>
  );
};

JoinTeamSuccess.propTypes = {
  i18next: React.PropTypes.object.isRequired
};

const CreateTeamSuccess = (props) => {
  return (
    <Success title={props.i18next.t('client.create_team_success.title')}
             description={props.i18next.t('client.create_team_success.description')}>
      <a href="/">
        <div className="btn btn-primary">
          {props.i18next.t('client.create_team_success.button_text')}
        </div>
      </a>
    </Success>
  );
};


CreateTeamSuccess.propTypes = {
  i18next: React.PropTypes.object.isRequired
};

export {Success, VisitorSuccess, JoinTeamSuccess, CreateTeamSuccess};