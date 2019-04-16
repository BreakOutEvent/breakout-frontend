import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';

class EmailConfirmationCheck extends React.Component {
  componentDidMount() {

  }

  render() {
    const style = {
      top: {
        backgroundColor: '#55AA55',
      }
    };

    return (this.props.isLoggedIn.me && this.props.isLoggedIn.me.blocked
      ? <div>
          <Snackbar
            style={style.top}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
              width: '100%'
            }}
            open
            onClose={this.handleClose}
            ContentProps={{
              'aria-describedby': 'message-id',
            }}
            message={<span id="message-id">Bitte bestätige deine Mail-Adresse</span>}
            action={[
              <Button key="undo" color="secondary" size="small" onClick={this.handleClose}>
                RESEND
              </Button>,
            ]}
          />
        </div>
      : <div></div>
    );
  }
}

EmailConfirmationCheck.propTypes = {
  isLoggedIn: PropTypes.object.isRequired,
};

export default EmailConfirmationCheck;