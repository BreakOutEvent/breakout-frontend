import React from 'react';
import { Paper, TextField, Button, InputAdornment, FormHelperText, Typography, IconButton,
  Snackbar } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types';
import RegisterLogin from './RegisterLogin.jsx';
import SponsorPresentation from './SponsorPresentation.jsx';
import SponsorInformation from './SponsorInformation.jsx';
import { styleChallenge } from './ListOfChallenges.jsx';

const challengeSuggestions = [
  'Ride with a policeman in his cars with sirenes on and do a selfie',
  'Hitchhike naked',
  'Kiss a random person',
  'Do a big mountain climb in the south of Germany with my friend Amanda, whom you are going to meet at a Hostel.'
];

class AddChallenge extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      renderAll: false,
      renderRegisterLogin: false,
      renderSponsorInformation: false,
      placeholderIndex: 0,
      amount: 10,
      description: '',
      me: null,
      errors: {},
      isAdding: false,
      justAdded: false,
      width: 200,
    };
    this.interval = setInterval(this.changeSuggestions.bind(this), 2000);
    this.validateAmount = this.validateAmount.bind(this);
    this.onCancelRegisterLogin = this.onCancelRegisterLogin.bind(this);
    this.onSuccessRegisterLogin = this.onSuccessRegisterLogin.bind(this);
    this.addChallenge = this.addChallenge.bind(this);
    this.onSuccessSponsorInformation = this.onSuccessSponsorInformation.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onClickOptions = this.onClickOptions.bind(this);
    this.updateWidth = this.updateWidth.bind(this);
    this.t = (content) => this.props.i18next.t(`client.sponsor.addChallenge.${content}`);
  }

  async componentWillMount() {
    const me = await this.props.api.getMe();
    this.setState({
      me
    });
  }

  componentDidMount() {
    this.updateWidth();
    window.addEventListener("resize", this.updateWidth);
  }

  updateWidth() {
    this.setState({width: document.getElementById('add-challenge').offsetWidth});
  }

  changeSuggestions() {
    this.setState({placeholderIndex:
        (challengeSuggestions.length === this.state.placeholderIndex + 1
          ? 0
          : this.state.placeholderIndex + 1
        )
    });
  }

  onSuccessRegisterLogin() {
    this.setState({
      renderRegisterLogin: false,
    });
    this.addChallenge();
  }

  onCancelRegisterLogin() {
    this.setState({
      renderRegisterLogin: false,
    });
  }

  onClickOptions() {
    this.setState({renderSponsorInformation: true})
  }

  onSubmit(event) {
    event.preventDefault();
    if (!this.state.errors.amount) {
      this.setState({isAdding: true});
      this.addChallenge();
    }
  }

  addChallenge() {
    this.props.api.getMe()
      .then(me => {
        if(!me.firstname) {
          this.setState({renderSponsorInformation: true});
          return
        }

        this.props.api.addChallenge(this.props.teamId,
          {
            description: this.state.description,
            amount: this.state.amount
          })
          .then(response => {
            this.props.update(response.sponsorId);
            this.setState({isAdding: false, amount: 10, description: "", justAdded: true});
          })})
      .catch(() => this.setState({renderRegisterLogin: true}));
  }

  validateAmount(amount) {
    const error = (/^\d+[.,]?\d{0,2}$/.test(amount)
      ? (parseInt(amount.replace(',', '.')) > 0 ? undefined : true)
      : true
    );
    this.setState(state => ({errors: { ...state.errors, amount: error }} ));
    return error;
  }

  async onSuccessSponsorInformation() {
    const me = await this.props.api.getMe();
    this.setState({renderSponsorInformation: false, me});
    if (this.state.isAdding) {
      this.addChallenge();
    }
  }

  render() {
    const style = styleChallenge('black');
    style.icon = {
      margin: '0 10px 0 0',
      width: '50px',
    }
    style.description.width = '100%';

    style.buttons = {
      display: 'flex',
      justifyContent: 'flex-end'
    }

    const me = this.state.me;

    return (
      <div id="add-challenge">
        <Paper elevation={1}>
          <form
            onFocus={e=>this.setState({renderAll: true})}
            onSubmit={this.onSubmit}
          >
            <Typography variant="h6" style={{padding: '10px 10px 5px'}}>
              {this.t('title')}
            </Typography>
            <div style={style.top}>
              <div style={style.icon}>
                <TextField
                  label=" "
                  value={this.state.amount}
                  onChange={e=>{this.setState({amount: e.target.value}); this.validateAmount(e.target.value);}}
                  InputProps={{ endAdornment: <InputAdornment position="end">€</InputAdornment> }}
                  error={this.state.errors.amount}
                />
              </div>
              <div style={style.description}>
                <TextField multiline fullWidth required
                label={this.t('description')}
                placeholder={challengeSuggestions[this.state.placeholderIndex]}
                value={this.state.description}
                onChange={e=>this.setState({description: e.target.value})}
                InputLabelProps={{ shrink: true }}
                rows={(this.state.width < 250 ? 4 : 2)}
                error={this.state.errors.description}
                />
              </div>
            </div>
            {me && this.state.renderAll && <SponsorPresentation
              firstname={me.firstname}
              lastname={me.lastname}
              company={me.sponsor.company}
              url={me.sponsor.url}
              logoUrl={me.sponsor.logo && me.sponsor.logo.url}
            />}
            {this.state.renderAll && <div style={style.buttons}>
              {me && <Button onClick={this.onClickOptions}>{this.t('options')}</Button>}
              <Button type="submit" color="primary">{this.t('submit')}</Button>
            </div>}
          </form>
        </Paper>
        <br />
        {this.state.renderRegisterLogin &&
        <RegisterLogin
          onCancel={this.onCancelRegisterLogin}
          onSuccess={this.onSuccessRegisterLogin}
          firstName={this.state.firstName}
          lastName={this.state.lastName}
          api={this.props.api}
          i18next={this.props.i18next}
        />}
        {this.state.renderSponsorInformation &&
        <SponsorInformation
          onCancel={e => this.setState({renderSponsorInformation: false})}
          onSuccess={this.onSuccessSponsorInformation}
          api={this.props.api}
          i18next={this.props.i18next}
        />}
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          open={this.state.justAdded}
          message={<span id="message-id">{this.t('success')}</span>}
          action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            onClick={e=>this.setState({justAdded: false})}
          >
            <CloseIcon />
          </IconButton>,
          ]}
        />
      </div>
    );
  }
}

AddChallenge.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  api: PropTypes.object.isRequired,
  teamId: PropTypes.number.isRequired,
  i18next: PropTypes.object.isRequired,
};

export default AddChallenge;