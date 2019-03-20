import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogTitle';
import { DialogActions, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import PropTypes from 'prop-types';

class SponsorInformation extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      error: null
    }
    this.updateInformation = this.updateInformation.bind(this);
  }

  async componentWillMount() {
    const me = await this.props.api.getMe();
    this.setState({
      me
    });
  }

  async updateInformation() {
    // TODO: input validation

    try {
      const updatedMe = await this.props.api.updateUserData(this.state.me.id, this.state.me);
      if (!updatedMe) throw new Error('Information update failed!');
      this.props.onSuccess();
    } catch (error) {
      this.onRegistrationError(error);
    }
  }

  render() {

    return <Dialog
      open={true}
      fullScreen={this.props.fullScreen}
      onClose={this.props.onCancel}
    >
      <form onSubmit={this.updateInformation}>
        <DialogTitle id="login-register">Sponsorinformationen</DialogTitle>
        <DialogContent>
          {this.state.error &&  <Typography variant="body1" color="error">{this.state.error}</Typography>}
          <Typography>Um ein Team zu unterstützen benötigen wir noch Informationen über dich.</Typography>
          {this.state.me && <TextField
            value={this.state.me.firstname}
            label="Vorname"
            onChange={event => {
              event.persist();
              this.setState(state => ({me: {...state.me, firstname: event.target.value}}));
            }}
          />}
        </DialogContent>
        <DialogActions style={{justifyContent: 'flex-end'}}>
          <Button onClick={this.props.onCancel} color="primary">
            Abbrechen
          </Button>
          <Button type="submit" color="primary">
            Weiter
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  }
}

SponsorInformation.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  i18next: PropTypes.object.isRequired,
  fullScreen: PropTypes.bool.isRequired,
};

export default withMobileDialog()(SponsorInformation);