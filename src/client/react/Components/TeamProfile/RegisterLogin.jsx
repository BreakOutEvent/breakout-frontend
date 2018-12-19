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

class RegisterLogin extends React.Component {

  constructor(props){
    super(props);
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
        <DialogTitle id="login-register">{"Login/Register"}</DialogTitle>
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
        />
        <DialogActions>
          <Button onClick={() => this.props.closeDialog()} color="primary">
            Cancel
          </Button>
          <Button onClick={() => this.props.closeDialog()} color="primary">
            Subscribe
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