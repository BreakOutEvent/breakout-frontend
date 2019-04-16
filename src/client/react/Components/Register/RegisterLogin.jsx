import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, FormControlLabel, Checkbox,
  FormHelperText, CircularProgress, TextField, withMobileDialog } from '@material-ui/core';
import PropTypes from 'prop-types';
import routes from '../routes'

const steps = {
  email: 'EMAIL',
  login: 'LOGIN',
  register: 'REGISTER'
}

class RegisterLogin extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      email: '',
      password: '',
      password2: '',
      error: {},
      step: steps.email,
      acceptedPrivacy: false,
      acceptedSponsorToS: false,
      isRegistering: false,
    }
    this.checkEmail = this.checkEmail.bind(this);
    this.login = this.login.bind(this);
    this.onLoginError = this.onLoginError.bind(this);
    this.register = this.register.bind(this);
    this.onRegistrationError = this.onRegistrationError.bind(this);
    this.t = (content) => this.props.i18next.t(`client.${content}`);
  }

  checkEmail(event) {
    event.preventDefault();
    this.props.api.checkEmailExistance(this.state.email).then(result =>
    {
      this.setState({step: (result ? steps.login : steps.register)});
    }
  )
  }

  onLoginError(err) {
    let message = err.message;
    if (err.response && err.response.status === 400) {
      message = this.t('login.wrong_password');
    }
    this.setState({
      error: {credentials: message}
    });
  }

  async login(event) {
    event.preventDefault();
    try {
      await this.props.api.login(this.state.email, this.state.password);
      await this.props.api.frontendLogin(this.state.email, this.state.password);
      this.props.onSuccess();
    } catch (err) {
      this.onLoginError(err);
    }
  }

  registrationIsValid() {
    let error = {};

    if (!this.state.email.length) {
      error.email = this.t('login.request_reset_enter_email');
    }

    // TODO: add translations
    if (this.state.password.length < 6) {
      error.password = this.t('registration.under_min_pw_length');
    }

    if (this.state.password !== this.state.password2) {
      error.password2 = this.t('registration.passwords_dont_match');
    }

    if (!this.state.acceptedPrivacy) {
      error.privacy = this.t('registration.accept_privacy');
    }

    if (!this.state.acceptedSponsorToS) {
      error.sponsorToS = this.t('registration.accept_sponsor_tos');
    }

    this.setState({ error });
    return (!error.password && !error.password2 && !error.privacy && !error.privacy && !error.sponsorToS);
  }

  onRegistrationError(error) {
    this.setState({ error });
  }

  async register(event) {
    event.preventDefault();
    if (this.registrationIsValid()) {
      try {
        this.setState({isRegistering: true})
        await this.props.api.createAccount(this.state.email, this.state.password);
        await this.props.api.login(this.state.email, this.state.password);
        await this.props.api.frontendLogin(this.state.email, this.state.password);
        this.props.onSuccess();
      } catch (err) {
        this.onRegistrationError(err);
      }
    }
  }

  render() {
    return <Dialog
      open={true}
      fullScreen={this.props.fullScreen}
      onClose={this.props.onCancel}
    >
      {(this.state.step === steps.email) &&
      <form onSubmit={this.checkEmail}>
        <DialogTitle id="login-register">{this.t('login.title_login_register')}</DialogTitle>
        <DialogContent>
          {this.state.error.email && <Typography variant="body1" color="error">{this.state.error.email}</Typography>}
            <TextField
              autoFocus
              label="E-Mail-Addresse"
              fullWidth
              onChange={event => this.setState({email:event.target.value})}
            />
        </DialogContent>
        <DialogActions style={{justifyContent: 'flex-end'}}>
          <Button onClick={this.props.onCancel} color="primary">
            {this.t('login.button_cancel')}
          </Button>
          <Button type="submit" color="primary">
            {this.t('login.button_continue')}
          </Button>
        </DialogActions>
      </form>}

      {(this.state.step === steps.login) &&
      <form onSubmit={this.login}>
        <DialogTitle>{this.t('login.button_login_headline')}</DialogTitle>
        <DialogContent>
          <TextField
            value={this.state.email}
            label={this.t('login.email_label')}
            fullWidth
            onChange={event => this.setState({email:event.target.value})}
          />
          <TextField
            autoFocus
            margin="dense"
            id="password"
            label={this.t('login.password_label')}
            type="password"
            fullWidth
            onChange={event => this.setState({password:event.target.value})}
          />
          {this.state.error.credentials && <FormHelperText error>{this.state.error.credentials}</FormHelperText>}
        </DialogContent>
        <DialogActions>
          <Button onClick={e => { window.location.href = routes.resetPassword; }} color="primary">
            {this.t('login.password_reset_text')}
          </Button>
          <Button onClick={this.props.onCancel} color="primary">
            {this.t('login.button_cancel')}
          </Button>
          <Button type="submit" color="primary">
            {this.t('login.button_login_headline')}
          </Button>
        </DialogActions>
      </form>}
      {(this.state.step === steps.register) &&
      <form onSubmit={this.register}>
        <DialogTitle>Registrieren</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            value={this.state.email}
            label={this.t('login.email_label')}
            type="email"
            fullWidth
            onChange={event => this.setState({email:event.target.value})}
            error={!!this.state.error.email}
          />{this.state.error.email &&
        <FormHelperText id="component-error-text">{this.state.error.email}</FormHelperText>}<br/>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label={this.t('login.password_label')}
            type="password"
            onChange={event => this.setState({password:event.target.value})}
            error={!!this.state.error.password}
          />{this.state.error.password &&
        <FormHelperText id="component-error-text">{this.state.error.password}</FormHelperText>}<br/>
          <TextField
            label={this.t('registration.repeat_password')}
            type="password"
            margin="dense"
            fullWidth
            onChange={event => this.setState({password2:event.target.value})}
            error={!!this.state.error.password2}
          />{this.state.error.password2 &&
        <FormHelperText id="component-error-text">{this.state.error.password2}</FormHelperText>}<br/>
          <FormControlLabel
            control={
              <Checkbox
                checked={this.state.acceptedPrivacy}
                onChange={e => {
                  e.persist();
                  this.setState({acceptedPrivacy: e.target.checked})
                }}
                color="primary"
              />}
            label={<span>{this.t('registration.accept')} <a href="/privacy-policy" target="_blank">{this.t('registration.privacy')}</a></span>}
            error={this.state.error.acceptedPrivacy}
          />{this.state.error.privacy &&
        <FormHelperText id="component-error-text">{this.state.error.privacy}</FormHelperText>}<br />
          <FormControlLabel
            control={
              <Checkbox
                checked={this.state.acceptedSponsorToS}
                onChange={e => {
                  e.persist();
                  this.setState({acceptedSponsorToS: e.target.checked})
                }}
                color="primary"
              />}
            label={<span>{this.t('registration.accept')} <a href="/sponsor-tos" target="_blank">{this.t('registration.sponsor_tos')}</a></span>}
            error={this.state.error.acceptedSponsorToS}
          />{this.state.error.sponsorToS &&
        <FormHelperText id="component-error-text">{this.state.error.sponsorToS}</FormHelperText>}
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onCancel} color="primary">
            {this.t('login.button_cancel')}
          </Button>
          <Button type="submit" color="primary">
            {this.t('login.button_registration_headline')}
          </Button>
          {this.state.isRegistering && <CircularProgress size={24} thickness={5} />}
        </DialogActions>
      </form>}
    </Dialog>
  }
}

RegisterLogin.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  i18next: PropTypes.object.isRequired,
  fullScreen: PropTypes.bool.isRequired,
};

export default withMobileDialog()(RegisterLogin);