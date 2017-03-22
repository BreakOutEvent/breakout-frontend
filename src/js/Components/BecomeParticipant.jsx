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
  Checkbox,
  Modal
} from 'react-bootstrap';

import store from 'store';
import RegistrationHeader from './RegistrationHeader.jsx';

export default class BecomeParticipant extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: true
    };
  }

  hide() {
    this.setState({
      visible: false
    })
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

    let api = await BreakoutApi.initFromServer();

    api.setAccessToken(store.get('accessToken'));

    try {
      await api.becomeParticipant(store.get('userId'), userData);
      this.props.nextStep();

    } catch (err) {
      this.setState({
        errorMessage: err.message
      })
    }
  }

  render() {
    return (
      <Modal
        show={this.props.visible}
        onHide={this.props.hide}>
        <RegistrationHeader
          title="Persönliche Daten"
          description="Erstelle ein neues Team und lade deinen Teampartner per Email ein, oder trete unten einem Team bei, falls du eingeladen wurdest!"
        />
        <Modal.Body>
          <div>
            <form>

              <Row style={{textAlign: 'center'}}>
                <Col sm={12}>
                  <ButtonGroup>
                    <Button id="male"
                            onClick={this.selectGender.bind(this)}
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
                <Col xs={12} style={{textAlign: 'center'}}>
                  <Button bsStyle="primary" onClick={this.register.bind(this)}>
                    Nächster Schritt
                  </Button>
                </Col>
              </Row>
            </form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          { this.state.errorMessage &&
          <div className="alert alert-warning" style={{textAlign: 'left'}}>
            {this.state.errorMessage}
          </div>
          }
        </Modal.Footer>
      </Modal>
    );
  }
}