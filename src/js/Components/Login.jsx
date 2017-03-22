import {
  Modal,
  FormControl,
  FormGroup,
  ControlLabel,
} from 'react-bootstrap';
import RegistrationHeader from './RegistrationHeader.jsx';
import React from 'react';
import BreakoutApi from '../BreakoutApi';
import i18next from 'i18next';
import store from 'store';
import {
  FullWidthButton
} from './Buttons.jsx';
import {
  TextInput,
  PasswordInput
} from './Inputs.jsx';

import de from '../../../resources/translations/translations.de.js';
import en from '../../../resources/translations/translations.en.js';

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

export default class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      firstTry: true,
    };
  }

  handleChange(event) {
    const target = event.target;
    this.setState({
      [target.id]: target.value
    });
  }

  validate(elemId) {

    if (this.state.firstTry) {
      return true;
    } else if (this.existsAndNotEmpty(elemId)) {
      return true;
    } else {
      return false;
    }
  }

  existsAndNotEmpty(elemId) {
    if (elemId === 'email') {
      return this.state.email && this.state.email !== '';
    } else if (elemId === 'password') {
      return this.state.password && this.state.password !== '';
    } else {
      return true;
    }
  }

  hide() {
    this.setState({
      firstTry: true,
      errorMessage: null,
      visible: false
    });
  }

  inputValidForLogin() {
    return this.state.email && this.state.password;
  }

  inputValidForRegistration() {
    return this.inputValidForLogin();
  }

  inputValidForReset() {
    return this.state.email;
  }

  displayError(message) {
    this.setState({
      errorMessage: message,
      firstTry: false
    });
  }

  displaySuccess(message) {
    this.setState({
      successMessage: message
    });
  }

  async login() {

    if (!this.inputValidForLogin()) {
      this.displayError(i18next.t('client.login.enter_email_or_password'));
      return;
    }

    this.toggleLoading('login');

    const api = await BreakoutApi.initFromServer();

    try {
      const tokens = await api.login(this.state.email, this.state.password);
      await api.frontendLogin(this.state.email, this.state.password);

      this.setState({
        errorMessage: false
      });

      store.set('tokens', tokens);
      this.next();
    } catch (err) {
      if (err.response.status === 400) {
        this.displayError(i18next.t('client.login.error_login'));
      } else {
        this.displayError(err.message);
      }
    } finally {
      this.toggleLoading('login');
    }
  }

  next() {
    this.props.next(this.props.steps.selectRole);
  }

  async register() {

    if (!this.inputValidForRegistration()) {
      this.displayError(i18next.t('client.login.enter_email_or_password'));
      return;
    }

    this.toggleLoading('registration');

    const api = await BreakoutApi.initFromServer();
    try {
      await api.createAccount(this.state.email, this.state.password);
      await this.login();

      this.setState({
        errorMessage: false
      });
      this.next();
    } catch (err) {
      if (err.response.status === 409) {
        this.displayError(i18next.t('client.login.registration_error_exists'));
      } else if (err.response.status === 400) {
        this.displayError(i18next.t('client.login.registration_error_bad_request'));
      } else {
        this.displayError(err.message);
      }
    } finally {
      this.toggleLoading('registration');
    }
  }

  toggleLoading(operation) {
    if (operation === 'registration') {
      this.setState({
        isRegistrationLoading: true
      });
    } else if (operation === 'login') {
      this.setState({
        isLoginLoading: true
      });
    }
  }

  async requestReset() {
    const api = await BreakoutApi.initFromServer();

    if (!this.inputValidForReset()) {
      this.displayError(i18next.t('client.login.request_reset_enter_email'));
      return;
    }

    try {
      await api.requestPasswordReset(this.state.email);
      this.displaySuccess(i18next.t('client.login.request_reset_success'));
    } catch (err) {
      if (err.response.status === 404) {
        this.displayError(i18next.t('client.login.request_reset_not_registered'));
      } else {
        this.displayError(err.message);
      }
    }
  }

  render() {

    return (
      <Modal show={this.props.visible} onHide={this.props.hide} bsSize="small">

        <RegistrationHeader title={i18next.t('client.login.button_login_headline')}/>

        <Modal.Body>

          <TextInput id='email'
                     isValid={this.validate.bind(this)}
                     label={i18next.t('client.login.email_label')}
                     value={this.state.email || ''}
                     placeholder={i18next.t('client.login.email_placeholder')}
                     glyph={null}
                     onChange={this.handleChange.bind(this)}/>

          <PasswordInput id={'password'}
                         isValid={this.validate.bind(this)}
                         label={i18next.t('client.login.password_label')}
                         value={this.state.password || ''}
                         placeholder={i18next.t('client.login.password_placeholder')}
                         glyph={null}
                         onChange={this.handleChange.bind(this)}/>

          <FullWidthButton style='transparent' onClick={this.requestReset.bind(this)}>
            {i18next.t('client.login.password_reset_text')}
          </FullWidthButton>


        </Modal.Body>

        <Modal.Footer>

          { this.state.errorMessage &&
          <div className="alert alert-warning" style={{textAlign: 'left'}}>
            {this.state.errorMessage}
          </div>
          }

          { this.state.successMessage &&
          <div className="alert alert-success" style={{textAlign: 'left'}}>
            {this.state.successMessage}
          </div>
          }

          <FullWidthButton style="default"
                           onClick={this.login.bind(this)}
                           loading={this.state.isLoginLoading}>
            {i18next.t('client.login.button_login_text')}
          </FullWidthButton>

          <FullWidthButton style="primary" onClick={this.register.bind(this)}
                           loading={this.state.isRegistrationLoading}>
            {i18next.t('client.login.button_register_text')}
          </FullWidthButton>

        </Modal.Footer>
      </Modal>
    );
  }
}

