import React from 'react';
import {
  Modal,
  Row,
  Breadcrumb
} from 'react-bootstrap';

import CreateAccount from './CreateAccount.jsx';
import BecomeParticipant from './BecomeParticipant.jsx';
import CreateOrJoinTeam from './CreateOrJoinTeam.jsx';

const RegistrationBreadcrumbItem = (props) => {

  if (props.active) {
    return (
      <Breadcrumb.Item active>
        {props.text}
      </Breadcrumb.Item>
    );
  } else {
    return (
      <Breadcrumb.Item onClick={props.onClick}>
        {props.text}
      </Breadcrumb.Item>
    );
  }
};

export default class Registration extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      step: 'createAccount',
      error: null,
      visible: this.props.visible
    };

    this.steps = {
      createAccount: {
        order: 1,
        title: 'Registrieren',
        breadcrumb: 'Registrieren',
        next: 'becomeParticipant'
      },
      becomeParticipant: {
        order: 2,
        title: 'Deine Teilnehmerdaten',
        breadcrumb: 'Teilnehmerdaten',
        next: 'createOrJoinTeam'
      },
      createOrJoinTeam: {
        order: 3,
        title: 'Ein Team erstellen',
        breadcrumb: 'Team erstellen',
        next: 'success'
      },
      success: {
        order: 4,
        title: 'Erfolgreich registiert!',
        breadcrumb: '',
        next: 'success'
      }
    };
  }

  getTitleForCurrentStep() {
    return this.steps[this.state.step].title;
  }

  getBreadcrumbTextForStep(step) {
    return this.steps[step].breadcrumb;
  }

  isActive(step) {
    return this.state.step === step;
  }

  onError(error) {
    this.setState({
      error: error
    });
  }

  createErrorMessage() {
    if (!this.state.error) {
      return null;
    }

    return (
      <div className="alert alert-warning" style={{textAlign: 'left'}}>
        Es ist ein Fehler aufgetreten: {this.parseError(this.state.error)}
      </div>
    );
  }

  parseError(error) {
    if (error != null) {
      return error.message || JSON.stringify(error);
    }
  }

  nextStep() {
    setTimeout(() => {
      this.setState({
        step: this.steps[this.state.step].next,
        error: null
      });
    }, 1000);
  }

  transitionTo(step) {
    if (!this.isActive(step)) {
      this.setState({
        step: step
      });
    }
  }

  currentStep() {
    switch (this.state.step) {
      case 'createAccount':
        return <CreateAccount nextStep={this.nextStep.bind(this)}
                              onError={this.onError.bind(this)}/>;
      case 'becomeParticipant':
        return <BecomeParticipant nextStep={this.nextStep.bind(this)}
                                  onError={this.onError.bind(this)}/>;
      case 'createOrJoinTeam':
        return <CreateOrJoinTeam nextStep={this.nextStep.bind(this)}
                                 onError={this.onError.bind(this)}/>;
      case 'success':
        return <div>Wuuhuu, willkommen an Bord!</div>;
      default:
        return null;
    }
  }

  render() {
    return (
      <Modal show={this.state.visible}
             onHide={() => this.setState({visible: false})}>
        <Modal.Header style={{
          paddingTop: '20px'
        }} closeButton>
          <Row style={{textAlign: 'center'}}>
            <Breadcrumb style={{
              backgroundColor: 'transparent'
            }}>

              <RegistrationBreadcrumbItem
                text={this.getBreadcrumbTextForStep('createAccount')}
                onClick={() => this.transitionTo('createAccount')}
                active={this.isActive('createAccount')}
              />

              <RegistrationBreadcrumbItem
                text={this.getBreadcrumbTextForStep('becomeParticipant')}
                onClick={() => this.transitionTo('becomeParticipant')}
                active={this.isActive('becomeParticipant')}
              />

              <RegistrationBreadcrumbItem
                text={this.getBreadcrumbTextForStep('createOrJoinTeam')}
                onClick={() => this.transitionTo('createOrJoinTeam')}
                active={this.isActive('createOrJoinTeam')}
              />

            </Breadcrumb>
            <h2>{this.getTitleForCurrentStep()}</h2>
          </Row>
        </Modal.Header>
        <Modal.Body>
          {this.currentStep()}
        </Modal.Body>

        <Modal.Footer>
          {this.createErrorMessage()}
        </Modal.Footer>
      </Modal>
    );
  }
}
