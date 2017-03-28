import React from 'react';
import ReactDOM from 'react-dom';

import BreakoutApi from './BreakoutApi';

import Login from './Components/Login/Login.jsx';
import Registration from './Components/Register/Registration.jsx';
import Participation from './Components/Participate/Participation.jsx';
import SelectRole from './Components/SelectRole/SelectRole.jsx';
import ResetPassword from './Components/ResetPassword/ResetPassword.jsx';
import CreateOrJoinTeam from './Components/CreateOrJoinTeam.jsx';
import de from '../../resources/translations/translations.de';
import en from '../../resources/translations/translations.en';
import i18next from 'i18next';
import Modal from './Components/Modal.jsx';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';
import {getAccessToken} from './Components/helpers';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      api: this.props.api,
      activeModal: null,
    };
  }

  componentWillMount() {

    i18next.init({
      lng: window.getBoUserLang(),
      fallbackLng: 'de',
      resources: {
        de: {
          translation: de
        },
        en: {
          translation: en
        }
      }
    });

    this.setState({i18next: i18next});
  }

  onHide() {
    location.replace('/');
  }

  showModalFor(Comp) {
    return (props) => {
      return (
        <Modal show={true} onHide={this.onHide.bind(this)}>
          <Comp {...props} api={this.props.api} i18next={this.state.i18next}/>
        </Modal>
      );
    };
  }

  render() {
    return (
      <Router>
        <div>
          <Route exact path="/r/login" component={this.showModalFor(Login)}/>
          <Route exact path="/r/register" component={this.showModalFor(Registration)}/>
          <Route exact path="/r/reset-password" component={this.showModalFor(ResetPassword)}/>
          <Route exact path="/r/select-role" component={this.showModalFor(SelectRole)}/>
          <Route exact path="/r/participate" component={this.showModalFor(Participation)}/>
          <Route exact path="/r/create-join-team" component={this.showModalFor(CreateOrJoinTeam)}/>
        </div>
      </Router>
    );
  }
}

App.propTypes = {
  api: React.PropTypes.object
};

const createReactApp = (api) => {
  api.setAccessToken(getAccessToken());
  ReactDOM.render(
    <App api={api}/>,
    document.getElementById('react-root')
  );
};

BreakoutApi.initFromServer()
  .then(createReactApp)
  .catch(console.error);