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
      step: steps.email
    }
    this.checkEmail = this.checkEmail.bind(this);
  }

  checkEmail() {
    console.log(this.props.api);
    this.props.api.checkEmailExistance(this.state.email).then(result =>
    {
      console.log(result)
      this.setState({step: (result ? steps.login : steps.register)});
    }
  )
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
        <DialogTitle id="login-register">Einloggen/Registrieren</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ooops, you aren't logged in yet. Please enter your e-mail address to proceed:
          </DialogContentText>
        </DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Email Address"
          type="email"
          fullWidth
          onChange={event => this.setState({email:event.target.value})}
        />
        <DialogActions>
          <Button onClick={() => this.props.closeDialog()} color="primary">
            Cancel
          </Button>
          <Button onClick={() => this.checkEmail()} color="primary">
            Weiter
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

RegisterLogin.propTypes = {
  fullScreen: PropTypes.bool.isRequired,
  closeDialog: PropTypes.func.isRequired
};

export default withMobileDialog()(RegisterLogin);