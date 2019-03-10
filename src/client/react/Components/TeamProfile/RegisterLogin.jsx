import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogTitle';
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
      error: null,
      step: steps.email
    }
    this.checkEmail = this.checkEmail.bind(this);
    this.login = this.login.bind(this);
    this.onLoginError = this.onLoginError.bind(this);
  }

  checkEmail() {
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

  async login() {
    try {
      await this.props.api.frontendLogin(this.state.email, this.state.password);
      this.props.closeDialog();
      this.props.onSuccess();
    } catch (err) {
        this.onLoginError(err);
    }
  }

  render() {
    const { fullScreen } = this.props;

    return(
      <Dialog
        fullScreen={fullScreen}
        open={true}
        onClose={() => this.props.closeDialog()}
        id="login-register"
      >
        {(this.state.step === steps.email) &&
          <div>
            <DialogTitle id="login-register">Einloggen/Registrieren</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Ooops, you aren't logged in yet. Please enter your e-mail address to proceed:
                {this.state.error && <p>{this.state.error}</p>}
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Email Address"
                type="email"
                fullWidth
                onChange={event => this.setState({email:event.target.value})}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.checkEmail()} color="primary">
                Weiter
              </Button>
            </DialogActions>
          </div>}
        {(this.state.step === steps.login) &&
        <div>
          <DialogTitle id="login-register">Einloggen</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Account: {this.state.email}<br />
              Please enter your password:
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Password"
              type="password"
              fullWidth
              onChange={event => this.setState({password:event.target.value})}
            />
            {this.state.error && <p>{this.state.error }</p>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.login()} color="primary">
              Einloggen
            </Button>
          </DialogActions>
        </div>}
      </Dialog>
    );
  }
}

RegisterLogin.propTypes = {
  fullScreen: PropTypes.bool.isRequired,
  closeDialog: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  i18next: PropTypes.object.isRequired,
};

export default withMobileDialog()(RegisterLogin);