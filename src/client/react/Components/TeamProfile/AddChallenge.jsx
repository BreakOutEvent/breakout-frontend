import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import InputAdornment from '@material-ui/core/InputAdornment';
import PropTypes from 'prop-types';

const challengeSuggestions = [
  'Do a handstand',
  'Hitchhike naked',
  'Kiss a random person',
  'Do a big mountain climb in the south of Germany with my friend Amanda, whom you are going to meet at a Hostel.'
];

class AddChallenge extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      placeholderIndex: 0,
      amount: 0,
      description: ''
    };
    this.interval = setInterval(this.changeSuggestions.bind(this), 2000);
    this.handleClickAt = this.handleClickAt.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  changeSuggestions() {
    this.setState({placeholderIndex:
        (challengeSuggestions.length === this.state.placeholderIndex + 1
          ?0
          :this.state.placeholderIndex + 1
        )
    });
  }

  handleClickAt() {
    this.props.api.getMe()
      .then(() => {
        this.props.api.addChallenge(this.props.teamId,
          {
            description: this.state.description,
            amount: this.state.amount
          })
          .then(response => this.props.update(response.sponsorId));
      })
      .catch(() => this.setState({open: true}));
  }

  handleClose() {
    this.setState({open: false});
  }

  render() {
    return (
      <div>
        <Paper>
          <TextField
            id="ChallengeProposal"
            placeholder={challengeSuggestions[this.state.placeholderIndex]}
            value={this.state.dscription}
            onChange={event=>this.setState({description:event.target.value})}
            multiline
            rows={3}
          />
          <TextField
            id="Amount"
            value={this.state.amount}
            type="number"
            onChange={event => this.setState({amount:event.target.value})}
            InputProps={{
              startAdornment: <InputAdornment position="start">€</InputAdornment>
            }}
          />
          <Button
            variant="extendedFab"
            onClick={this.handleClickAt}>Add a challenge</Button>
        </Paper>
      <br/>
          <Dialog
          fullScreen
          open={this.state.open}
          onClose={this.handleClose}>
          <AppBar>
            <Toolbar>
              <IconButton color="inherit" onClick={this.handleClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
              <Typography variant="title" color="inherit">
                Login/Register
              </Typography>
            </Toolbar>
          </AppBar>
        </Dialog>
      </div>
    );
  }
}

AddChallenge.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  api: PropTypes.object.isRequired,
  teamId: PropTypes.number.isRequired
};

export default AddChallenge;