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

const RoleSelector = (props) => {

  const style = {
    textAlign: 'center',
    borderRadius: '3px',
    border: '1px solid'
  };

  return (
    <Col sm={4} style={style}>
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

  register() {
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

  render() {
    return (
      <div>
        <Row>
          <RoleSelector title="Zuschauer" body="Kommentieren von Beiträgen"/>
          <RoleSelector title="Teilnehmer" body="Melde dich für BreakOut 2017 an"/>
          <RoleSelector title="Sponsor" body="Unterstütze dein favorisiertes Team 2017"/>
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
                         value={this.state.emailValue}
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