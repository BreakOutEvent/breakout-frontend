import React from 'react';
import {
  Col,
  Row,
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  Alert,
} from 'react-bootstrap';

import BreakoutApi from '../BreakoutApi';
import store from 'store';

const colors = {
  primary: '#E6823C',
  secondary: '#34323B',
  brand: '#3F8FAE',
  logo: '#EAE79E'
};

const RoleSelector = (props) => {

  const style = {
    textAlign: 'center',
    borderRadius: '3px',
    border: '1px solid'
  };

  if (props.selected) {
    style.backgroundColor = colors.primary;
    style.color = colors.secondary;
  }

  return (
    <Col sm={4} style={style} onClick={props.onClick}>
      <b>{props.title}</b>
      <p>{props.body}</p>
    </Col>
  );
};

export default class CreateAccount extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      registrationError: null,
      step: 'CREATE_ACCOUNT',
      selectedRole: 'PARTICIPANT',
    };
  }

  componentDidMount() {
    this.api = new BreakoutApi('http://localhost:8082/', 'breakout_app', '123456789', true);
  }

  emailChanged(e) {
    this.setState({
      email: e.target.value
    });
  }

  passwordChanged(e) {
    this.setState({
      password: e.target.value
    });
  }

  validateEmail() {
    if (this.state.email !== '') {
      return 'success';
    } else {
      return 'error';
    }
  }

  validatePassword() {
    if (this.state.password !== '') {
      return 'success';
    } else {
      return 'error';
    }
  }

  async register() {
    try {
      const userAccount = await this.api.createAccount(this.state.email, this.state.password);
      const data = this.api.login(this.state.email, this.state.password);

      store.set('userId', userAccount.id);
      store.set('accessToken', data.access_token);

      this.setState({
        registrationError: false,
        registrationSuccess: true
      });

      this.props.nextStep();

    } catch (err) {
      this.setState({registrationError: err});
    }
  }

  alertIfNeeded() {
    if (this.state.registrationError) {
      return (
        <Alert bsStyle="warning">
          Something went wrong: {this.state.registrationError.message}
        </Alert>
      );
    } else if (this.state.registrationSuccess) {
      return (
        <Alert bsStyle="success">
          Account erfolgreich erstellt. Auf zum nächsten Schritt!
        </Alert>
      );
    } else {
      return null;
    }
  }

  render() {
    return (
      <div>
        <Row>
          <RoleSelector title="Zuschauer" body="Kommentieren von Beiträgen"
                        selected={this.state.selectedRole === 'VIEWER'}
                        onClick={() => {
                          this.setState({
                            selectedRole: 'VIEWER'
                          });
                        }}/>

          <RoleSelector title="Teilnehmer" body="Melde dich für BreakOut 2017 an"
                        selected={this.state.selectedRole === 'PARTICIPANT'}
                        onClick={() => {
                          this.setState({
                            selectedRole: 'PARTICIPANT'
                          });
                        }}/>

          <RoleSelector title="Sponsor" body="Unterstütze dein favorisiertes Team 2017"
                        selected={this.state.selectedRole === 'SPONSOR'}
                        onClick={() => {
                          this.setState({
                            selectedRole: 'SPONSOR'
                          });
                        }}/>

        </Row>

        <br/>
        <Row>
          <Col xs={12}>
            Wähle deine Account Rolle, die du bei BreakOut einnehmen möchtest. Du kannst diese
            später jederzeit wechseln!
          </Col>
        </Row>
        <br/>

        <form>
          <FormGroup controlId="registrationEmail" validationState={this.validateEmail()}>
            <ControlLabel>
              Deine Email-Adresse
            </ControlLabel>
            <FormControl type="text"
                         value={this.state.email}
                         placeholder="Enter Email"
                         onChange={this.emailChanged.bind(this)}>
            </FormControl>
          </FormGroup>
          <FormGroup controlId="password" validationState={this.validatePassword()}>
            <ControlLabel>
              Dein Passwort
            </ControlLabel>
            <FormControl type="password"
                         value={this.state.password}
                         placeholder="Passwort"
                         onChange={this.passwordChanged.bind(this)}>
            </FormControl>
          </FormGroup>
        </form>

        <Row>
          {this.alertIfNeeded()}
        </Row>

        <Row>
          <Col xs={12} style={{textAlign: 'center'}}>
            <Button bsStyle="primary" onClick={this.register.bind(this) }>
              Kostenlos registrieren
            </Button>
          </Col>
          <br/>
          <Col xs={12} style={{textAlign: 'center', paddingTop: '10px'}}>
            <Button bsStyle="primary"
                    style={{backgroundColor: 'transparent', 'border': 'none', color: 'grey'}}>
              Du hast bereits einen Account?
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}