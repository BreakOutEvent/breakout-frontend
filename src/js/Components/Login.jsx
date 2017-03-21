import {
  Modal,
  FormControl,
  FormGroup,
  ControlLabel,
} from 'react-bootstrap';

import React from 'react';
import BreakoutApi from '../BreakoutApi';
import i18next from 'i18next';
import store from 'store';

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
      return null;
    } else if (this.existsAndNotEmpty(elemId)) {
      return null;
    } else {
      return 'error';
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

  onHide() {
    this.setState({
      firstTry: true,
      errorMessage: null
    });
    this.props.onHide();
  }

  async login() {

    if (!this.state.email || !this.state.password) {
      this.setState({
        errorMessage: i18next.t('client.login.enter_email_or_password'),
        firstTry: false
      });

      return Promise.reject();
    }

    const api = await BreakoutApi.initFromServer();

    try {
      const tokens = await api.login(this.state.email, this.state.password);
      await api.frontendLogin(this.state.email, this.state.password);

      this.setState({
        errorMessage: false
      });

      store.set('tokens', tokens);
      this.props.onHide();

    } catch (err) {
      if (err.response.status === 400) {
        this.setState({
          errorMessage: i18next.t('client.login.error_login')
        });
      } else {
        this.setState({
          errorMessage: JSON.stringify(err)
        });
      }
    }
  }

  async register() {

    if (!this.state.email || !this.state.password) {
      this.setState({
        errorMessage: i18next.t('client.login.enter_email_or_password'),
        firstTry: false
      });
      return Promise.reject();
    }

    const api = await BreakoutApi.initFromServer();
    try {
      await api.createAccount(this.state.email, this.state.password);
      this.setState({
        errorMessage: false
      });
    } catch (err) {
      if (err.response.status === 409) {
        this.setState({
          errorMessage: i18next.t('client.login.registration_error_exists'),
        });
      } else if (err.response.status === 400) {
        this.setState({
          errorMessage: i18next.t('client.login.registration_error_bad_request')
        });
      } else {
        this.setState({
          errorMessage: JSON.stringify(err)
        });
      }
    }
  }

  async requestReset() {
    const api = await BreakoutApi.initFromServer();

    if (this.state.email === null) {
      this.setState({
        errorMessage: i18next.t('client.login.request_reset_enter_email')
      });

      return Promise.reject();
    }

    try {
      await api.requestPasswordReset(this.state.email);
      this.setState({
        successMessage: i18next.t('client.login.request_reset_success')
      });
    } catch (err) {
      if (err.response.status === 404) {
        this.setState({
          errorMessage: i18next.t('client.login.request_reset_not_registered')
        });
      }
    }
  }

  render() {

    const forgotPasswordStyle = {
      width: '100%',
      backgroundColor: 'transparent',
      color: '#BDBDBD',
      fontSize: 'small',
      border: 'none',
      marginTop: '-8px'
    };

    const styleLogin = {
      width: '100%',
      marginBottom: '10px',
      height: '44px',
      borderRadius: '50px',
      backgroundColor: 'transparent',
      color: '#e6823c',
      borderWidth: '2px',
      textTransform: 'uppercase'
    };

    const styleRegister = {
      width: '100%',
      height: '44px',
      borderRadius: '50px',
      textTransform: 'uppercase'
    };

    return (
      <Modal
        show={this.props.visible}
        onHide={this.onHide.bind(this)}
        bsSize="small">
        <Modal.Header style={{paddingTop: '10px', paddingBottom: '0px'}} closeButton>
          <h1 style={{textAlign: 'center', fontSize: 'xx-large'}}>
            {i18next.t('client.login.button_login_headline')}
          </h1>
        </Modal.Header>
        <Modal.Body>

          <FormGroup controlId="email" validationState={this.validate('email')}>
            <ControlLabel>
              {i18next.t('client.login.email_label')}
            </ControlLabel>
            <FormControl type="text"
                         value={this.state.email || ''}
                         placeholder={i18next.t('client.login.email_placeholder')}
                         onChange={this.handleChange.bind(this)}>
            </FormControl>
          </FormGroup>

          <FormGroup controlId="password" validationState={this.validate('password')}>
            <ControlLabel>
              {i18next.t('client.login.password_label')}
            </ControlLabel>
            <FormControl type="password"
                         value={this.state.password || ''}
                         placeholder={i18next.t('client.login.password_placeholder')}
                         onChange={this.handleChange.bind(this)}>
            </FormControl>
          </FormGroup>

          <div className="row">
            <div className="col-sm-12">
              <button className="btn btn-primary"
                      style={forgotPasswordStyle}
                      onClick={this.requestReset.bind(this)}>
                {i18next.t('client.login.password_reset_text')}
              </button>
            </div>
          </div>


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

          <div className="row">
            <div className="col-sm-12">
              <button className="btn btn-primary"
                      style={styleLogin}
                      onClick={this.login.bind(this)}>
                {i18next.t('client.login.button_login_text')}
              </button>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <button className="btn btn-primary"
                      style={styleRegister}
                      onClick={this.register.bind(this)}>
                {i18next.t('client.login.button_register_text')}
              </button>
            </div>
          </div>

        </Modal.Footer>
      </Modal>
    );
  }
}

