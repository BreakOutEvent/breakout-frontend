import React from 'react';
import { Paper, TextField, Button, InputAdornment, FormHelperText, Typography, IconButton,
  Snackbar } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types';
import RegisterLogin from './RegisterLogin.jsx';
import SponsorPresentation from './SponsorPresentation.jsx';
import SponsorInformation from './SponsorInformation.jsx';
import { styleChallenge } from './ListOfChallenges.jsx';

const calcRows = (width) => {
  if (width < 200) return 4;
  if (width < 300) return 3;
  if (width < 500 ) return 2;
  return 1;
}

const style = styleChallenge('black');
style.title = {
  padding: '10px 10px 5px',
}
style.icon = {
  marginRight: 10,
  width: 50,
}
style.top.padding = 10;
style.top.alignItems = 'top';
style.description.width = '100%';
style.buttons = {
  display: 'flex',
  justifyContent: 'flex-end'
}

class AddChallenge extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      renderAll: false,
      renderRegisterLogin: false,
      renderSponsorInformation: false,
      placeholderIndex: 0,
      suggestionCount: 8,
      amount: 10,
      description: '',
      me: null,
      errors: {},
      isAdding: false,
      justAdded: false,
      width: 200,
    };
    this.interval = setInterval(this.changeSuggestions.bind(this), 3000);
    this.validateAmount = this.validateAmount.bind(this);
    this.onSuccessRegisterLogin = this.onSuccessRegisterLogin.bind(this);
    this.onSuccessSponsorInformation = this.onSuccessSponsorInformation.bind(this);
    this.addChallenge = this.addChallenge.bind(this);
    this.updateWidth = this.updateWidth.bind(this);
    this.t = (content) => this.props.i18next.t(`client.sponsor.addChallenge.${content}`);
  }

  async componentDidMount() {
    this.setState({
      me: await this.props.api.getMe()
    });
    this.updateWidth();
    window.addEventListener("resize", this.updateWidth);
  }

  updateWidth() {
    this.setState({width: document.getElementById('add-challenge').offsetWidth});
  }

  changeSuggestions() {
    this.setState({placeholderIndex:
        (this.state.placeholderIndex + 1 === this.state.suggestionCount
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

  addChallenge(event) {
    if(event) event.preventDefault();
    if (this.state.errors.amount) return false;
    this.setState({isAdding: true});

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
            if(this.props.update) this.props.update(response.sponsorId);
            this.setState({isAdding: false, amount: 10, description: "", justAdded: true});
          })})
      .catch(() => this.setState({renderRegisterLogin: true}));
  }

  validateAmount(amount) {
    const error = (/^\d+[.,]?\d{0,2}$/.test(amount)
      ? (parseInt(amount.replace(',', '.')) > 0
          ? undefined : true)
      : true
    );
    this.setState(state => ({errors: { ...state.errors, amount: error }} ));
    return error;
  }

  async onSuccessSponsorInformation() {
    const me = await this.props.api.getMe();
    this.setState({renderSponsorInformation: false, me});
    this.props.update();
    if (this.state.isAdding) {
      this.addChallenge();
    }
  }

  render() {
    const me = this.state.me;

    return <div>
      <Paper elevation={1} id="add-challenge">
        <form
          onFocus={e=>this.setState({renderAll: true})}
          onSubmit={this.addChallenge}
        >
          <Typography variant="h6" style={style.title}>
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
              placeholder={this.t(`suggestions.${this.state.placeholderIndex}`)}
              value={this.state.description}
              onChange={e=>this.setState({description: e.target.value})}
              InputLabelProps={{ shrink: true }}
              rows={calcRows(this.state.width)}
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
            {me && <Button
              onClick={e=>this.setState({renderSponsorInformation: true})}>
              {this.t('options')}
            </Button>}
            <Button type="submit" color="primary">{this.t('submit')}</Button>
          </div>}
        </form>
      </Paper>
      <br />
      {this.state.renderRegisterLogin &&
      <RegisterLogin
        onCancel={e => this.setState({ renderRegisterLogin: false })}
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
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
    </div>;
  }
}

AddChallenge.propTypes = {
  api: PropTypes.object.isRequired,
  teamId: PropTypes.number.isRequired,
  i18next: PropTypes.object.isRequired,
};

export default AddChallenge;