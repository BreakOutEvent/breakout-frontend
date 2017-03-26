import React from 'react';
import ReactDOM from 'react-dom';

import BreakoutApi from './BreakoutApi';

import Modal from 'react-responsive-modal';

import Login from './Components/Login/Login.jsx';
import Registration from './Components/Register/Registration.jsx';
import Participation from './Components/Participate/Participation.jsx';
import SelectRole from './Components/SelectRole/SelectRole.jsx';
import ResetPassword from './Components/ResetPassword/ResetPassword.jsx';
import CreateOrJoinTeam from './Components/CreateOrJoinTeam.jsx';

import de from '../../resources/translations/translations.de';
import en from '../../resources/translations/translations.en';
import i18next from 'i18next';
import $ from 'jquery';

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
    const overlayStyle = {
      zIndex: 10000,
      backgroundColor: 'rgba(0,0,0,0.5)'
    };

    const modalStyle = {
      marginTop: '150px',
      marginLeft: '10px',
      marginRight: '10px',
      borderRadius: '5px',
      padding: '40px',
      minWidth: '300px',
      paddingBottom: '10px'
    };

    return (
      <Modal {...this.props}
             open={this.state.show}
             onClose={this.close.bind(this)}
             overlayStyle={overlayStyle}
             modalStyle={modalStyle}>
        {this.props.children}
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

    // login / register link in navbar on large screens
    $('#bo-login-btn').click(() => {
      this.setState({
        activeModal: 'login'
      });
    });

    // login / register link in dropdown
    $('#bo-btn-login-sm').click(() => {
      $('.navbar-toggle').click();
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
      resetPassword: ResetPassword
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
