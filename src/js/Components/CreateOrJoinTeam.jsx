import BreakoutApi from '../BreakoutApi';

import React from 'react';
import {
  Button, Col, Row, Modal, Radio
} from 'react-bootstrap';
import {TextInput, OptionsInput} from './Inputs.jsx';
import Promise from 'bluebird';
import store from 'store';
import i18next from 'i18next';
import de from '../../../resources/translations/translations.de.js';
import en from '../../../resources/translations/translations.en.js';
import {FullscreenCenteredButton} from './Buttons.jsx';

import {isUserLoggedIn, getAccessToken} from './helpers';

i18next.init({
  lng: window.getBoUserLang(),
  fallbackLng: 'de',
  resources: {
    de: {
      translation: de
    },
    en: {
      translation: en
    }
  }
});
import RegistrationHeader from './RegistrationHeader.jsx';

export default class CreateOrJoinTeam extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      events: [],
      invitations: [],
      visible: true
    };

  }

  hide() {
    this.setState({
      visible: false
    });
  }

  handleChange(event) {
    const target = event.target;
    let value = '';

    if (target.type === 'select-one') {
      value = target.options[target.selectedIndex].value;
    }
    else if (target.type === 'checkbox') {
      value = target.checked;
    }
    else {
      value = target.value;
    }

    const id = target.id;

    this.setState({
      [id]: value
    });
  }

  async componentDidMount() {

    if (!isUserLoggedIn()) {
      this.props.transitionTo(this.props.steps.login);
    } else {

      const api = await BreakoutApi.initFromServer();
      api.setAccessToken(getAccessToken());
      const isUserParticipant = await api.isUserParticipant();
      if (!isUserParticipant) {
        this.props.transitionTo(this.props.steps.becomeParticipant);
      } else {
        try {
          const {events, invitations} = await this.loadDataForComponent();
          this.updateState(events, invitations);
        } catch (err) {
          this.displayError(err.message);
        }
      }
    }
  }

  async loadDataForComponent() {
    const api = await BreakoutApi.initFromServer();
    api.setAccessToken(getAccessToken());
    const events = await api.getAllEvents();
    const invitations = await Promise.all(events.map(event => api.getInvitations(event.id)));
    return {events, invitations};
  }

  updateState(events, invitations) {
    this.setState({
      events: events,
      invitations: invitations.reduce((a, b) => a.concat(b))
    });
  }

  handleError(err) {
    if (!err.response) {
      this.displayError(err.message);
    }

    switch (err.response.status) {
      case 400:
        this.displayError('Error: ' + err.response.data.message);
        break;
      default:
        this.displayError(err.message);
    }
  }

  displayError(message) {
    this.setState({
      createTeamErrorMessage: message
    });
  }

  async createTeam() {

    if (!isUserLoggedIn()) {
      this.props.transitionTo('login');
    } else {

      if (!this.isValid('selectedEvent')) {
        this.displayError('Bitte wähle ein Event aus');
        return Promise.resolve();
      } else if (!this.isValid('teamName')) {
        this.displayError('Bitte gib deinem Team einen Namen');
        return Promise.resolve();
      } else if (!this.isValid('partnerEmail')) {
        this.displayError('Bitte gib die Emailadresse deines Teampartners an');
        return Promise.resolve();
      }

      const api = await BreakoutApi.initFromServer();
      api.setAccessToken(getAccessToken());

      try {
        const createdTeam = await api.createTeam(this.state.selectedEvent, {
          name: this.state.teamName,
          description: ''
        });

        await api.inviteToTeam(createdTeam.id, this.state.partnerEmail);
        this.props.transitionTo(this.props.steps.done);

      } catch (err) {
        this.handleError(err);
      }
    }
  }

  async joinTeam() {
    const api = await BreakoutApi.initFromServer();
    const token = store.get('accessToken');
    console.log(token);

    // TODO: Implement!
    if (!token) {
      // TODO: Make useful
      this.props.onError('Du bist nicht angemeldet. Bitte melde dich an!');
    }

    api.setAccessToken(token);

    try {
      const teamId = this.state.selectedTeam;
      await api.joinTeam(teamId);
      this.props.nextStep();
    } catch (err) {
      this.props.onError(err);
    }
  }

  selectTeam(e) {
    const target = e.target;
    const teamId = target.value;
    this.setState({
      selectedTeam: teamId
    });
  }

  isValid(elem) {
    const notNull = (elem) => !!elem;
    const notEmpty = (elem) => elem !== '';
    const and = (f1, f2) => (elem) => (f1(elem) && f2(elem));

    const validations = {
      selectedEvent: notNull,
      teamName: and(notNull, notEmpty),
      partnerEmail: and(notNull, notEmpty)
    };

    return validations[elem](this.state[elem]);
  }


  render() {
    return (
      <Modal show={this.props.visible} onHide={this.props.onHide}>
        <RegistrationHeader
          title={i18next.t('client.create_or_join_team.title')}
          description={i18next.t('client.create_or_join_team.description')}/>
        <Modal.Body>

          <div className="row">
            <div className="col-lg-12" style={{textAlign: 'center'}}>
              <b>Team erstellen</b>
            </div>
          </div>

          <OptionsInput id='selectedEvent'
                        isValid={this.isValid.bind(this)}
                        label={i18next.t('client.create_or_join_team.select_event')}
                        onChange={this.handleChange.bind(this)}
                        values={this.state.events.map(event => {
                          return {key: event.id, value: event.title};
                        })}/>

          <TextInput id='teamName'
                     isValid={this.isValid.bind(this)}
                     label={i18next.t('client.create_or_join_team.team_name.label')}
                     value={this.state.teamName || ''}
                     placeholder={i18next.t('client.create_or_join_team.team_name.placeholder')}
                     glyph={null}
                     onChange={this.handleChange.bind(this)}/>

          <TextInput id='partnerEmail'
                     isValid={this.isValid.bind(this)}
                     label={i18next.t('client.create_or_join_team.partner_email.label')}
                     value={this.state.partnerEmail || ''}
                     onChange={this.handleChange.bind(this)}
                     placeholder={i18next.t('client.create_or_join_team.partner_email.placeholder')}/>

          { this.state.createTeamErrorMessage &&
          <div className="alert alert-warning" style={{textAlign: 'left'}}>
            {this.state.createTeamErrorMessage}
          </div>
          }

          <FullscreenCenteredButton bsStyle="primary" onClick={this.createTeam.bind(this)}>
            Team erstellen & Anmeldung abschließen
          </FullscreenCenteredButton>


          { this.state.invitations.length > 0 &&
          <span>
            <hr style={{backgroundColor: '#e6823c', height: '2px'}}/>
          <div className="row">
            <div className="col-lg-12" style={{textAlign: 'center'}}>
              <b>Team beitreten</b>
            </div>
          </div>
          <InvitationInfo invitations={this.state.invitations}
                          onSubmit={this.joinTeam.bind(this)}
                          selectTeam={this.selectTeam.bind(this)}
                          selectedTeam={this.state.selectedTeam || null}/>

            <FullscreenCenteredButton onClick={this.createTeam.bind(this)}>
            Team beitreten & Anmeldung abschließen
            </FullscreenCenteredButton>
          </span>
          } { this.state.invitations.length < 0 &&
        <div className="alert alert-warning">
          Du hast aktuell noch keine Einladungen
        </div>
        }
        </Modal.Body>
        <Modal.Footer>

        </Modal.Footer>
      </Modal>
    );
  }
}

const InvitationInfo = (props) => {
  return (
    <span>
    <div className="alert alert-info">
    Du wurdest zu {props.invitations.length} Teams eingeladen
    </div>
      {props.invitations.map(invitation =>
        <Invitation key={invitation.team}
                    data={invitation}
                    selectTeam={props.selectTeam}
                    checked={invitation.team == props.selectedTeam}/>)}
    </span>
  );
};

const Invitation = (props) => {
  return (
    <div className="well well-sm">
      <Radio value={props.data.team}
             onChange={props.selectTeam}
             checked={props.checked || false}>

        <b>{props.data.team} {props.data.name}</b>
      </Radio>
    </div>);
};