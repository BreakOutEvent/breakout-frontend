import React from 'react';
import ReactDOM from 'react-dom';

import BreakoutApi from './BreakoutApi';

import {Modal} from 'react-bootstrap';

import Login from './Components/Login/Login.jsx';
import Registration from './Components/Register/Registration.jsx';
import Participation from './Components/Participate/Participation.jsx';
import SelectRole from './Components/SelectRole/SelectRole.jsx';
import CreateOrJoinTeam from './Components/CreateOrJoinTeam.jsx';

import de from '../../resources/translations/translations.de';
import en from '../../resources/translations/translations.de';
import i18next from 'i18next';

import {getAccessToken} from './Components/helpers';

class VisibleModal extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      show: this.props.show
    };
  }

  close() {
    this.props.onHide();
    this.setState({
      show: false
    });
  }

  render() {
    return (
      <Modal {...this.props} show={this.state.show} onHide={this.close.bind(this)}>
        <Modal.Header closeButton/>
        <Modal.Body>
          {this.props.children}
        </Modal.Body>
      </Modal>
    );
  }
}

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
      createOrJoinTeam: CreateOrJoinTeam,
      participate: Participation,
      selectRole: SelectRole,
    };

    this.setState({
      activeModal: null
    });
  }

  onHide() {
    this.setState({
      activeModal: null
    });
  }

  renderActiveModal() {
    if (this.state.activeModal && this.modals[this.state.activeModal]) {
      const activeM = this.modals[this.state.activeModal];
      return (
        <VisibleModal show={true} onHide={this.onHide.bind(this)}>
          {React.createElement(activeM, {
            i18next: this.state.i18next,
            api: this.state.api,
            show: this.show.bind(this)
          })
          }
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
