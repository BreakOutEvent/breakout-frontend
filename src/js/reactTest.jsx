import React from 'react';
import ReactDOM from 'react-dom';

import BreakoutApi from './BreakoutApi';

import Login from './Components/Login/Login.jsx';
import Registration from './Components/Register/Registration.jsx';
import Participation from './Components/Participate/Participation.jsx';
import SelectRole from './Components/SelectRole/SelectRole.jsx';
import ResetPassword from './Components/ResetPassword/ResetPassword.jsx';
import CreateOrJoinTeam from './Components/CreateOrJoinTeam.jsx';
import {VisitorSuccess, JoinTeamSuccess, CreateTeamSuccess} from './Components/Success.jsx';
import de from '../../resources/translations/translations.de';
import en from '../../resources/translations/translations.en';
import i18next from 'i18next';
import Modal from './Components/Modal.jsx';
import {
  BrowserRouter as Router,
  Route,
  Redirect
} from 'react-router-dom';

import routes from './Components/routes';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      api: this.props.api,
      activeModal: null,
      isLoggedIn: !!window.boUserData
    };
  }

  componentWillMount() {

    i18next.init({
      lng: window.getBoUserLang(),
      fallbackLng: 'en',
      resources: {
        de: {
          translation: de
        },
        en: {
          translation: en
        }
      }
    });

    const url = window.boClientConfig.baseUrl;
    const clientId = window.boClientConfig.clientId;
    const clientSecret = window.boClientConfig.clientSecret;
    const api = new BreakoutApi(url, clientId, clientSecret);

    const isLoggedIn = window.boUserData;

    if (isLoggedIn) {
      api.setAccessToken(window.boUserData.access_token);
    }

    this.setState({i18next: i18next, api: api});
  }


  onHide() {
    document.body.className = '';
    location.replace('/');
  }

  showModalFor(Comp, size) {

    const OnShowHack = () => {
      document.body.className += ' ReactModal__Body--open';
      return null;
    };

    return (props) => {
      return (
        <Modal show={true}
               onHide={this.onHide.bind(this)}
               modalClassName={'modal-size-' + size + ' react-modal'}>
          <OnShowHack></OnShowHack>
          <Comp {...props} api={this.state.api} i18next={this.state.i18next}
                isLoggedIn={!!window.boUserData}/>
        </Modal>
      );
    };
  }

  render() {

    const PrivateRoute = (props) => {

      const render = (componentProps) => {
        if (this.state.isLoggedIn) {
          return React.createElement(props.component, componentProps);
        } else {
          return <Redirect to={{pathname: routes.login, state: {from: props.location}}}/>;
        }
      };

      let propsCopy = Object.assign({}, props);
      delete propsCopy.component;
      return <Route {...propsCopy} render={render}/>;
    };

    return (
      <Router>
        <div>

          <Route exact path={routes.login}
                 component={this.showModalFor(Login, 's')}/>

          <Route exact path={routes.register}
                 component={this.showModalFor(Registration, 's')}/>

          <Route exact path={routes.resetPassword}
                 component={this.showModalFor(ResetPassword, 's')}/>

          <PrivateRoute exact path={routes.selectRole}
                        component={this.showModalFor(SelectRole, 'm')}/>

          <PrivateRoute exact path={routes.participate}
                        component={this.showModalFor(Participation, 'm')}/>

          <PrivateRoute exact path={routes.createOrJoinTeam}
                        component={this.showModalFor(CreateOrJoinTeam, 'm')}/>

          <PrivateRoute exact path={routes.visitorSuccess}
                        component={this.showModalFor(VisitorSuccess, 's')}/>

          <PrivateRoute exact path={routes.joinTeamSuccess}
                        component={this.showModalFor(JoinTeamSuccess, 'm')}/>

          <PrivateRoute exact path={routes.createTeamSuccess}
                        component={this.showModalFor(CreateTeamSuccess, 's')}/>

        </div>
      </Router>
    );
  }
}

App.propTypes = {
  api: React.PropTypes.object
};

ReactDOM.render(
  <App />
  , document.getElementById('react-root'));