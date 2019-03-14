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

  }


  render() {
    return <Dialog
      open={true}
      fullScreen={this.props.fullScreen}
      onClose={this.props.onCancel}
    >
      Wir bräuchten noch ein paar Informationen.
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