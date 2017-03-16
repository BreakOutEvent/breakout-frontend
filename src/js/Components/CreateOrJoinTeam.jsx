import BreakoutApi from "../BreakoutApi";

import React from 'react';
import {
  FormGroup,
  FormControl,
  ControlLabel,
  Button,
  Col,
  Row
} from 'react-bootstrap';

var testEventData = [
  {
    "id": 1,
    "title": "BreakOut Berlin",
    "date": 1464937200,
    "city": "Berlin",
    "startingLocation": {
      "latitude": 52.512643,
      "longitude": 13.321876
    },
    "duration": 36
  },
  {
    "id": 2,
    "title": "BreakOut München",
    "date": 1464937200,
    "city": "München",
    "startingLocation": {
      "latitude": 48.150676,
      "longitude": 11.580984
    },
    "duration": 36
  },
  {
    "id": 3,
    "title": "Breakout München 2017",
    "date": 1488464649,
    "city": "München",
    "startingLocation": {
      "latitude": 0.0,
      "longitude": 0.0
    },
    "duration": 36
  },
  {
    "id": 4,
    "title": "Mein ganz eigenes Testevent",
    "date": 1489591050,
    "city": "München",
    "startingLocation": {
      "latitude": 0.0,
      "longitude": 0.0
    },
    "duration": 36
  }
]

export default class CreateOrJoinTeam extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleChange(event) {
    const target = event.target;
    var value = '';

    if(target.type === "select-one"){
      value = target.options[target.selectedIndex].text;
    }
    else if( target.type === 'checkbox'){
      value =  target.checked;
    }
    else {
      value =  target.value;
    }

    const id = target.id;

    this.setState({
      [id]: value
    });
  }

  register() {
    const teamData = {
      eventname: this.state.eventname,
      partneremail: this.state.partnerEmail,
      teamname: this.state.Teamnamen
      }
    };

    // var api = new BreakoutApi("https://backend.break-out.org", "", "", true);
    // api.login("nico.scordialo@break-out.org", "12345");
    // api.becomeParticipant("backend.break-out.org", userData)
      // .then(() => {
      //   // this.props.nextStep();
      //   this.setState({
      //     registrationError: false,
      //     registrationSuccess: true
      //   });
      // })
      // .catch((err) => this.setState({registrationError: err}));
  // }

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

        <FormGroup controlId="eventname" validationState={'error'}>
          <ControlLabel>
            Event
          </ControlLabel>
          <FormControl componentClass="select"
                       placeholder="Wähle aus, von welchem Standort du starten möchtest"
                       onChange={this.handleChange.bind(this)}>

                       {testEventData.map((event) => <option value={event.title}>{event.title}</option>)}
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

        <Row>
          <Col xs={12} style={{textAlign: 'center'}}>
            <Button bsStyle="primary">
              Team erstellen und Anmeldung abschließen
            </Button>
          </Col>
        </Row>

        <hr/>

        <div className="alert alert-info">
          Du hast Einladungen zu einem Team
        </div>

        <form>

          <div className="well well-sm">
            <div className="row">
              <div className="col-sm-1" style={{verticalAlign: 'center', textAlign: 'center'}}>
                <input type="checkbox"/>
              </div>
              <div className="col-sm-11">
                <b>Team Mui Bien in Barcelona 2017 beitreten</b>
                <br/>Du wurdest von Florian Schmidt eingeladen (florian.schmidt.1994@icloud.com)
              </div>
            </div>
          </div>

        </form>

        <Row>
          <Col xs={12} style={{textAlign: 'center'}}>
            <Button bsStyle="primary">
              Dem ausgewählten Team beitreten
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}
