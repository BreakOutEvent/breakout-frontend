import BreakoutApi from '../BreakoutApi';

import React from 'react';
import {
  FormGroup,
  FormControl,
  ControlLabel,
  Button,
  Col,
  Row
} from 'react-bootstrap';

import Promise from 'bluebird';
import store from 'store';

const Invitation = (props) => {
  return (
    <div className="well well-sm">
      <div className="row">
        <div className="col-sm-1" style={{verticalAlign: 'center', textAlign: 'center'}}>
          <input type="checkbox"/>
        </div>
        <div className="col-sm-11">
          <b>{props.data.team} {props.data.name}</b>
          {/*<br/>Du wurdest von Florian Schmidt eingeladen (florian.schmidt.1994@icloud.com)*/}
        </div>
      </div>
    </div>);
};

export default class CreateOrJoinTeam extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      events: [],
      invitations: []
    };

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
    const api = new BreakoutApi('http://localhost:8082', 'breakout_app', '123456789', true);
    const token = store.get('accessToken');
    console.log(token);
    // TODO: Implement!
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

    const api = new BreakoutApi('http://localhost:8082', 'breakout_app', '123456789', true);
    const token = store.get('accessToken');
    console.log(token);
    // TODO: Implement!
    if (!token) {
      throw Error('No token in store. Needs login!');
    }

    api.setAccessToken(token);

    try {
      await api.createTeam(this.state.selectedEvent, {
        name: this.state.teamName,
        description: ''
      });
      this.props.nextStep();
    } catch (err) {
      // TODO!!
      throw err;
    }

  }

  render() {
    return (
      <div>
        Erstelle ein neues Team und lade deinen Teampartner per Email ein, oder trete unten einem
        Team bei, falls du eingeladen wurdest!

        {/* TODO: Make this clean!*/}
        <br />
        <br />

        <FormGroup controlId="teamName" validationState={'error'}>
          <ControlLabel>
            Teamname
          </ControlLabel>
          <FormControl type="text"
                       value={this.state.teamName || ''}
                       placeholder="Gib einen Teamnamen an"
                       onChange={this.handleChange.bind(this)}/>
        </FormGroup>

        <FormGroup controlId="selectedEvent" validationState={'error'}>
          <ControlLabel>
            Event
          </ControlLabel>
          <FormControl componentClass="select"
                       placeholder="Wähle aus, von welchem Standort du starten möchtest"
                       onChange={this.handleChange.bind(this)}>

            {this.state.events.map((event) => <option key={event.id}
                                                      value={event.id}>{event.title}</option>)}

          </FormControl>
        </FormGroup>
        <FormGroup controlId="partnerEmail" validationState={'error'}>
          <ControlLabel>
            Email deines Teampartners
          </ControlLabel>
          <FormControl type="text"
                       value={this.state.partnerEmail || ''}
                       placeholder="Gib die Emailadresse deines Teampartners an"
                       onChange={this.handleChange.bind(this)}/>
        </FormGroup>

        <br />

        <FullscreenCenteredButton bsStyle="primary" onClick={this.createTeam.bind(this)}>
          Team erstellen und Anmeldung abschließen
        </FullscreenCenteredButton>

        <hr/>

        <InvitationInfo invitations={this.state.invitations}/>

      </div>
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
        {this.state.invitations.map(invitation => <Invitation key={invitation.id}
                                                              data={invitation}/>)}
        <FullscreenCenteredButton bsStyle="primary">
          Dem ausgewählten Team beitreten
        </FullscreenCenteredButton>
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