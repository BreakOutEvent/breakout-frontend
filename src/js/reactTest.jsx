import React from 'react';
import ReactDOM from 'react-dom';

import BreakoutApi from './BreakoutApi';

import {Modal} from 'react-bootstrap';

import Login from './Components/Login/Login.jsx';
import Registration from './Components/Register/Registration.jsx';
import Participation from './Components/Participate/Participation.jsx';
import TeamCreation from './Components/TeamCreation/TeamCreation.jsx';
import JoinTeam from './Components/JoinTeam/JoinTeam.jsx';

import de from '../../resources/translations/translations.de';
import en from '../../resources/translations/translations.de';
import i18next from 'i18next';

import {getAccessToken} from './Components/helpers';

const VisibleModal = (props) => {
  return (
    <Modal {...props} show={true}>
      <Modal.Body>
        {props.children}
      </Modal.Body>
    </Modal>
  );
};

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

  componentDidMount() {
    this.registerModals();
    this.registerJQueryListeners();
  }

  registerJQueryListeners() {
    $('#bo-login-btn').click(() => {
      this.setState({
        activeModal: 'login'
      });
    });
  }

  registerModals() {
    this.modals = {
      login: Login,
      register: Registration,
      joinTeam: JoinTeam,
      createTeam: TeamCreation,
      participate: Participation
    };

    this.setState({
      activeModal: null
    });
  }

  renderActiveModal() {
    if (this.state.activeModal && this.modals[this.state.activeModal]) {
      const activeM = this.modals[this.state.activeModal];
      return (
        <VisibleModal>
          {React.createElement(activeM, {i18next: this.state.i18next, api: this.state.api})}
        </VisibleModal>
      );
    } else {
      return null;
    }
  }

  show(modalId) {
    // TODO: Error handling
    this.setState({
      activeModal: modalId
    });
  }

  render() {
    return (
      <span>
        {this.renderActiveModal()}
      </span>
    );
  }
}

BreakoutApi.initFromServer()
  .then(api => {
    api.setAccessToken(getAccessToken());
    ReactDOM.render(
      <App api={api}/>,
      document.getElementById('react-root')
    );

  }).catch(console.error);
