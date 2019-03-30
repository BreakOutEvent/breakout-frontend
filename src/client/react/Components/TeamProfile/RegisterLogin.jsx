import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogTitle';
import { DialogActions, Typography, FormControlLabel, Checkbox, FormHelperText } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import PropTypes from 'prop-types';

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
    }
    this.checkEmail = this.checkEmail.bind(this);
    this.login = this.login.bind(this);
    this.onLoginError = this.onLoginError.bind(this);
    this.register = this.register.bind(this);
    this.onRegistrationError = this.onRegistrationError.bind(this);
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
    if (err.response && err.response.status === 401) {
      message = this.props.i18next.t('client.login.wrong_password');
    }
    this.setState({
      error: message
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

    // TODO: add translations
    if (this.state.password.length < 6) {
      error.password = this.props.i18next.t('client.registration.under_min_pw_length')
    }

    if (this.state.password !== this.state.password2) {
      error.password2 = this.props.i18next.t('client.registration.passwords_dont_match')
    }

    if (!this.state.acceptedPrivacy) {
      error.privacy = 'Bitte akzeptiere die Datenschutzerklärung';
    }

    if (!this.state.acceptedSponsorToS) {
      error.sponsorToS = 'Bitte akzeptiere die Teilnahmebedingungen';
    }

    this.setState({ error });
    return (error !== {});
  }

  onRegistrationError(error) {
    this.setState({ error });
  }

  async register(event) {
    event.preventDefault();
    if (this.registrationIsValid()) {
      try {
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
        <DialogTitle id="login-register">Benutzerkonto</DialogTitle>
        <DialogContent>
          {this.state.error.mail && <Typography variant="body1" color="error">{this.state.error.mail}</Typography>}
            <TextField
              autoFocus
              label="E-Mail-Addresse"
              fullWidth
              onChange={event => this.setState({email:event.target.value})}
            />
        </DialogContent>
        <DialogActions style={{justifyContent: 'flex-end'}}>
          <Button onClick={this.props.onCancel} color="primary">
            Abbrechen
          </Button>
          <Button type="submit" color="primary">
            Weiter
          </Button>
        </DialogActions>
      </form>}

      {(this.state.step === steps.login) &&
      <form onSubmit={this.login}>
        <DialogTitle>Einloggen</DialogTitle>

        <DialogContent>
          <TextField
            value={this.state.email}
            label="E-Mail-Addresse"
            fullWidth
            onChange={event => this.setState({email:event.target.value})}
          />
          <TextField
            autoFocus
            margin="dense"
            id="password"
            label="Password"
            type="password"
            fullWidth
            onChange={event => this.setState({password:event.target.value})}
          />
          {this.state.error && <p>{this.state.error }</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onCancel} color="primary">
            Abbrechen
          </Button>
          <Button type="submit" color="primary">
            Einloggen
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
            label="E-Mail-Addresse"
            type="email"
            onChange={event => this.setState({email:event.target.value})}
          /><br />
          <TextField
            autoFocus
            margin="dense"
            label="Password"
            type="password"
            onChange={event => this.setState({password:event.target.value})}
          />{this.state.error.password &&
        <FormHelperText id="component-error-text">{this.state.error.password}</FormHelperText>}<br/>
        <TextField
            label="Password wiederholen"
            type="password"
            margin="dense"
            onChange={event => this.setState({password2:event.target.value})}
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
            label={<span>Ich akzeptiere die <a href="/privacy-policy" target="_blank">Datenschutzbedingungen</a></span>}
          />{this.state.error.privacy &&
        <FormHelperText id="component-error-text">{this.state.error.privacy}</FormHelperText>}<br/>
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
            label={<span>Ich akzeptiere die <a href="/sponsor-tos" target="_blank">Teilnahmebedingungen</a></span>}
          />{this.state.error.sponsorToS &&
        <FormHelperText id="component-error-text">{this.state.error.sponsorToS}</FormHelperText>}
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onCancel} color="primary">
            Abbrechen
          </Button>
          <Button type="submit" color="primary">
            Registrieren
          </Button>
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