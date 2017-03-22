import React from 'react';
import ReactDOM from 'react-dom';
import Login from './Components/Login.jsx';
import RoleSelector from './Components/RoleSelector.jsx';
import CreateOrJoinTeam from './Components/CreateOrJoinTeam.jsx';
import BecomeParticipant from './Components/BecomeParticipant.jsx';
import $ from 'jquery';

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      currentStep: null,
      context: {}
    };

    this.steps = {
      createOrJoinTeam: 'createOrJoinTeam',
      login: 'login',
      selectRole: 'roleSelect',
      becomeParticipant: 'becomeParticipant',
      done: ''
    };
  }

  componentWillMount() {
    $('#bo-login-btn').click(() => this.setState({
      currentStep: this.steps.login
    }));
  }

  hide() {
    this.setState({
      currentStep: null
    });
    location.reload(true);
  }

  isActive(step) {
    return step === this.state.currentStep;
  }

  transitionTo(step) {
    this.setState({
      currentStep: step
    });
  }


  render() {
    switch (this.state.currentStep) {
      case null:
        return null;

      case this.steps.login:
        return <Login onHide={this.hide.bind(this)}
                      visible={this.isActive(this.steps.login)}
                      next={this.transitionTo.bind(this)}
                      steps={this.steps}
                      context={this.state.context}/>;

      case this.steps.createOrJoinTeam:
        return <CreateOrJoinTeam onHide={this.hide.bind(this)}
                                 visible={this.isActive(this.steps.createOrJoinTeam)}
                                 next={this.transitionTo.bind(this)}
                                 steps={this.steps}
                                 context={this.state.context}/>;

      case this.steps.selectRole:
        return <RoleSelector onHide={this.hide.bind(this)}
                             visible={this.isActive(this.steps.selectRole)}
                             next={this.transitionTo.bind(this)}
                             steps={this.steps}
                             context={this.state.context}/>;

      case this.steps.becomeParticipant:
        return <BecomeParticipant onHide={this.hide.bind(this)}
                                  visible={this.isActive(this.steps.becomeParticipant)}
                                  transitionTo={this.transitionTo.bind(this)}
                                  steps={this.steps}
                                  context={this.state.context}/>;
      case this.steps.done:
        return null;

      default:
        return null;
    }
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById('react-root')
);