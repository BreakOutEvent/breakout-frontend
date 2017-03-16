import BreakoutApi from '../BreakoutApi';

import React from 'react';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  ButtonGroup,
  Row,
  Col,
  Alert,
  Checkbox
} from 'react-bootstrap';

import store from 'store';

export default class BecomeParticipant extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleChange(event) {

    const target = event.target;
    let value = '';

    if (target.type === 'select-one') {
      value = target.options[target.selectedIndex].text;
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

  selectGender(event) {
    const target = event.target;
    const id = target.id;
    this.setState({
      gender: id
    });
  }

  getStyleForGender(gender) {
    if (this.state.gender === gender) {
      return 'btn-primary';
    } else {
      return '';
    }
  }

  alertIfNeeded() {
    if (this.state.registrationError) {
      return (
        <Alert bsStyle="warning">
          Something went wrong: + {this.state.registrationError.message}
        </Alert>
      );
    } else {
      return null;
    }
  }

  async register() {

    const userData = {
      firstname: this.state.firstname,
      lastname: this.state.lastname,
      participant: {
        tshirtsize: this.state.tshirtSize,
        phonenumber: this.state.contactNumber,
        emergencynumber: this.state.emergencyNumber
      }
    };

    let api = new BreakoutApi('http://localhost:8082', 'breakout_app', '123456789', true);

    api.setAccessToken(store.get('accessToken'));

    try {
      await api.becomeParticipant(store.get('userId'), userData)
      this.setState({
        registrationError: false,
        registrationSuccess: true
      });
      this.props.nextStep();

    } catch (err) {
      this.setState({registrationError: err});
    }
  }

  render() {
    return (
      <div>
        <form>

          <Row style={{textAlign: 'center'}}>
            <Col sm={12}>
              <ButtonGroup>
                <Button id="male"
                        onClick={this.selectGender.bind(this)} c
                        className={this.getStyleForGender('male')}>
                  Männlich
                </Button>
                <Button id="female"
                        onClick={this.selectGender.bind(this)}
                        className={this.getStyleForGender('female')}>
                  Weiblich
                </Button>
              </ButtonGroup>
            </Col>
          </Row>

          <FormGroup controlId="firstname" validationState={'error'}>
            <ControlLabel>
              Vorname
            </ControlLabel>
            <FormControl type="text"
                         value={this.state.firstname || ''}
                         placeholder="Gib deinen Vornamen ein"
                         onChange={this.handleChange.bind(this)}/>
          </FormGroup>

          <FormGroup controlId="lastname" validationState={'error'}>
            <ControlLabel>
              Nachname
            </ControlLabel>
            <FormControl type="text"
                         value={this.state.lastname || ''}
                         placeholder="Gib deinen Nachnamen ein"
                         onChange={this.handleChange.bind(this)}/>
          </FormGroup>

          <FormGroup controlId="tshirtSize" validationState={'error'}>
            <ControlLabel>
              T-Shirt Größe
            </ControlLabel>
            <FormControl componentClass="select"
                         placeholder="Wähle eine Tshirtgröße aus"
                         onChange={this.handleChange.bind(this)}>
              <option value="s">S</option>
              <option value="m">M</option>
              <option value="l">L</option>
              <option value="xl">XL</option>
            </FormControl>
          </FormGroup>

          <FormGroup controlId="contactNumber" validationState={'error'}>
            <ControlLabel>
              Handynummer
            </ControlLabel>
            <FormControl type="text"
                         value={this.state.contactNumber || ''}
                         placeholder="Eine Handynummer, unter der wir dich während des Events erreichen können"
                         onChange={this.handleChange.bind(this)}/>
          </FormGroup>

          <FormGroup controlId="emergencyNumber" validationState={'error'}>
            <ControlLabel>
              Notfallnummer
            </ControlLabel>
            <FormControl type="text"
                         value={this.state.emergencyNumber || ''}
                         placeholder="Telefonnummer eines Notfallkontakts"
                         onChange={this.handleChange.bind(this)}/>
          </FormGroup>

          <FormGroup>

            <Checkbox id="acceptsTos"
                      onChange={this.handleChange.bind(this)}>
              Hiermit akzeptiere ich die Teilnahmebedingungen
            </Checkbox>

            <Checkbox id="acceptsCodeOfHonour"
                      onChange={this.handleChange.bind(this)}>
              Hiermit akzeptiere ich den Code of Honour
            </Checkbox>

            <Checkbox id="is18"
                      checked={this.state.is18 || false}
                      onChange={this.handleChange.bind(this)}>
              Ich bin mindestens 18 Jahre alt
            </Checkbox>

          </FormGroup>

          <Row>
            {this.alertIfNeeded()}
          </Row>

          <Row>
            <Col xs={12} style={{textAlign: 'center'}}>
              <Button bsStyle="primary" onClick={this.register.bind(this)}>
                Nächster Schritt
              </Button>
            </Col>
          </Row>
        </form>
      </div>
    );
  }
}
