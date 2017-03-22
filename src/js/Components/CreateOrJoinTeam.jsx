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
    const api = await BreakoutApi.initFromServer();
    const token = store.get('tokens').access_token;

    if (!token) {
      throw Error('No token in store. Needs login!');
    }

    api.setAccessToken(token);
    const events = await api.getAllEvents();
    const invitations = await Promise.all(events.map(event => api.getInvitations(event.id)));
    this.setState({
      events: events,
      invitations: invitations.reduce((a, b) => a.concat(b))
    });
  }


  async createTeam() {

    const api = await BreakoutApi.initFromServer();
    const token = store.get('tokens').access_token;
    console.log(token);

    if (!token) {
      // TODO: Make useful
      this.props.onError('Du bist nicht angemeldet. Bitte melde dich an!');
    }


    api.setAccessToken(token);

    try {

      const createdTeam = await api.createTeam(this.state.selectedEvent, {
        name: this.state.teamName,
        description: ''
      });

      await api.inviteToTeam(createdTeam.id, this.state.partnerEmail);
      this.props.nextStep();

    } catch (err) {
      // TODO!!
      throw err;
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

  render() {
    return (
      <Modal show={this.props.visible} onHide={this.props.onHide}>
        <RegistrationHeader
          title={i18next.t('client.create_or_join_team.title')}
          description={i18next.t('client.create_or_join_team.description')}/>
        <Modal.Body>

          <OptionsInput id='selectedEvent'
                        isValid={() => true}
                        label={i18next.t('client.create_or_join_team.select_event')}
                        onChange={this.handleChange.bind(this)}
                        values={this.state.events.map(e => e.title)}/>

          <TextInput id='teamName'
                     isValid={() => true}
                     label={i18next.t('client.create_or_join_team.team_name.label')}
                     value={this.state.teamName || ''}
                     placeholder={i18next.t('client.create_or_join_team.team_name.placeholder')}
                     glyph={null}
                     onChange={this.handleChange.bind(this)}/>

          <TextInput id='partnerEmail'
                     isValid={() => true}
                     label={i18next.t('client.create_or_join_team.partner_email.label')}
                     value={this.state.partnerEmail || ''}
                     onChange={this.handleChange.bind(this)}
                     placeholder={i18next.t('client.create_or_join_team.partner_email.placeholder')}/>

          <InvitationInfo invitations={this.state.invitations}
                          onSubmit={this.joinTeam.bind(this)}
                          selectTeam={this.selectTeam.bind(this)}
                          selectedTeam={this.state.selectedTeam || null}/>

          <FullscreenCenteredButton bsStyle="primary" onClick={this.createTeam.bind(this)}>
            Team erstellen und Anmeldung abschließen
          </FullscreenCenteredButton>

        </Modal.Body>
        <Modal.Footer>

        </Modal.Footer>
      </Modal>
    );
  }
}

const InvitationInfo = (props) => {
  if (props.invitations.length > 0) {

    return (
      <span>
    <div className="alert alert-info">
    Du wurdest zu {props.invitations.length} Teams eingeladen
    </div>
        {props.invitations.map(invitation => <Invitation key={invitation.team}
                                                         data={invitation}
                                                         selectTeam={props.selectTeam}
                                                         checked={invitation.team == props.selectedTeam}/>)}
    </span>
    );

  } else {

    return (
      <div className="alert alert-warning">
        Du hast aktuell noch keine Einladungen
      </div>
    );

  }
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

const FullscreenCenteredButton = (props) => {
  return (
    <Row>
      <Col xs={12}
           style={{textAlign: 'center'}}>
        <Button bsStyle={props.bsStyle}
                onClick={props.onClick}>
          {props.children}
        </Button>
      </Col>
    </Row>
  );
};