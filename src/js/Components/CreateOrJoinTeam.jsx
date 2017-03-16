import React from 'react';
import {
  FormGroup,
  FormControl,
  ControlLabel,
  Button,
  Col,
  Row
} from 'react-bootstrap';

export default class CreateOrJoinTeam extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const id = target.id;

    this.setState({
      [id]: value
    });
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

        <FormGroup controlId="tshirtSize" validationState={'error'}>
          <ControlLabel>
            Event
          </ControlLabel>
          <FormControl componentClass="select"
                       placeholder="Wähle aus, von welchem Standort du starten möchtest">
            <option value="Berlin 2016">Berlin 2016</option>
            <option value="München 2016">München 2016</option>
            <option value="Berlin 2017">Berlin 2017</option>
            <option value="München 2017">München 2017</option>
            <option value="Barcelona 2017">Barcelona 2017</option>
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