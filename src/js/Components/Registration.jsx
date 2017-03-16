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
      step: 'createOrJoinTeam'
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
        next: null
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

  nextStep() {
    setTimeout(() => {
      this.setState({
        step: this.steps[this.state.step].next
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
        return <CreateAccount nextStep={this.nextStep.bind(this)}/>;
      case 'becomeParticipant':
        return <BecomeParticipant nextStep={this.nextStep.bind(this)}/>;
      case 'createOrJoinTeam':
        return <CreateOrJoinTeam nextStep={this.nextStep.bind(this)}/>;
      default:
        return null;
    }
  }

  render() {
    return (
      <Modal show={this.props.visible}>
        <Modal.Header style={{
          paddingTop: '20px'
        }}>
          <Row style={{textAlign: 'center'}}>
            <Breadcrumb style={{
              backgroundColor: 'transparent'
            }}>

              <RegistrationBreadcrumbItem
                text={this.getBreadcrumbTextForStep('createAccount')}
                onClick={() => {
                  this.transitionTo('createAccount');
                }}
                active={this.isActive('createAccount')}
              />

              <RegistrationBreadcrumbItem
                text={this.getBreadcrumbTextForStep('becomeParticipant')}
                onClick={() => {
                  this.transitionTo('becomeParticipant');
                }}
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
      </Modal>
    );
  }
}