import React from 'react';
import { Paper, TextField, Button, InputAdornment, FormHelperText, Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import RegisterLogin from './RegisterLogin.jsx';
import SponsorInformation from './SponsorInformation.jsx';
import { styleChallenge } from './ListOfChallenges.jsx';

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
      renderAll: false,
      renderRegisterLogin: false,
      renderSponsorInformation: false,
      placeholderIndex: 0,
      amount: 10,
      description: '',
      me: null,
      errors: {}
    };
    this.interval = setInterval(this.changeSuggestions.bind(this), 2000);
    this.validateAmount = this.validateAmount.bind(this);
    this.validateDescription = this.validateDescription.bind(this);
    this.onClickAdd = this.onClickAdd.bind(this);
    this.onCancelRegisterLogin = this.onCancelRegisterLogin.bind(this);
    this.onSuccessRegisterLogin = this.onSuccessRegisterLogin.bind(this);
    this.addChallenge = this.addChallenge.bind(this);
  }

  async componentWillMount() {
    const me = await this.props.api.getMe();
    this.setState({
      me
    })
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

  onClickAdd() {
    if(!this.validateAmount(this.state.amount) ||
      !this.validateDescription(this.state.description)
    ) {
      this.setState(state => ({
        errors: {
          ...state.errors,
          challenge: 'Bitte behebe zunächst alle Probleme.'
        }
      }));
    } else {
      this.setState({ errors: { ...this.state.errors, challenge: undefined }} );
      this.addChallenge();
    }
  }

  addChallenge() {
    this.props.api.getMe()
      .then(me => {
        // TODO: check if everything required is available
        console.log(me);
        if(!me.firstname) {
          this.setState({renderSponsorInformation: true});
          return
        }

        this.props.api.addChallenge(this.props.teamId,
          {
            description: this.state.description,
            amount: this.state.amount
          })
          .then(response => this.props.update(response.sponsorId));
      })
      .catch(() => this.setState({renderRegisterLogin: true}));
  }

  validateAmount(amount) {
    const patternAmount = /^\d+[.,]?\d{0,2}$/;
    if (!patternAmount.test(amount)) {
      this.setState(state => ({errors: { ...state.errors, amount: 'Ungültig' }} ));
    } else if (parseInt(this.state.amount) <= 0) {
      this.setState(state => ({errors: { ...state.errors, amount: 'Zu gering' }} ));
    } else {
      this.setState({errors: { ...this.state.errors, amount: undefined }} );
      return true;
    }
    return false;
  }

  validateDescription(description) {
    if(description.length === 0) {
      this.setState(state => ({errors: { ...this.state.errors, description: 'Bitte ausfüllen' }} ));
    } else {
      this.setState( {errors: {...this.state.errors, description: undefined }} );
      return true;
    }
    return false;
  }

  render() {
    const style = styleChallenge('black');
    style.icon = {
      margin: '0 10px 0 0',
      width: '50px',
    }
    style.description.width = '100%';

    style.name = {
      width: '49%',
    }

    style.buttons = {
      float: 'right',
      display: (this.state.renderAll ? 'inline' : 'none'),
    }

    style.button = {
      margin: '5px',
      padding: '8px'
    }

    style.top.minHeight = 0;
    style.bottom = {
      ...style.bottom,
      display: (this.state.renderAll ? 'block' : 'none'),
      height: 'auto'
    }

    const me = this.state.me;
    const company = me
      ? me.sponsor.url
        ? <div><a href={me.sponsor.url}>{me.sponsor.company}</a></div>
        : me.sponsor.company
      : undefined;

    return (
      <div>
        <Paper style={{marginBottom: '20px'}} elevation={1}>
          <Typography variant="h6" style={{padding: '10px 10px 5px'}}>
            Stelle eine Challenge
          </Typography>
          {this.state.errors.challenge &&
            <Typography style={{margin: '5px'}} color="error">{this.state.errors.challenge}</Typography>}
          <div style={style.top}>
            <div style={style.icon}>
              <TextField
                error={!!this.state.errors.amount}
                id="Amount"
                label="Summe"
                value={this.state.amount}
                onChange={e=>{this.setState({amount: e.target.value}); this.validateAmount(e.target.value);}}
                onFocus={e=>this.setState({renderAll: true})}
                InputProps={{
                  endAdornment: <InputAdornment position="end">€</InputAdornment>
                }}
              />
              {this.state.errors.amount &&
                <FormHelperText id="component-error-text">{this.state.errors.amount}</FormHelperText>
              }
            </div>
            <div style={style.description}>
              <TextField
              id="ChallengeProposal"
              label="Herausforderung"
              placeholder={challengeSuggestions[this.state.placeholderIndex]}
              value={this.state.description}
              onChange={e=>{this.setState({description: e.target.value}); this.validateDescription(e.target.value)}}
              onFocus={e=>this.setState({renderAll: true})}
              multiline
              fullWidth
              error={!!this.state.errors.description}
              />
              {this.state.errors.description &&
              <FormHelperText id="component-error-text">{this.state.errors.description}</FormHelperText>
              }
            </div>
          </div>
          {me && <div style={style.bottom}>
            <div style={style.sponsor}>
              {me.firstName} {me.lastName}<br/>
              {company}
            </div>
            <div style={style.logo}>
              <img src={me.url} style={style.image}/>
            </div>
          </div>}
          <div style={style.buttons}>
            <Button
              variant="outlined"
              color="primary"
              onClick={this.onClickAdd}
              style={style.button}>Hinzufügen</Button>
          </div>
          <div style={{clear: 'both'}} />
        </Paper>

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
          onCancel={e => {this.setState({renderSponsorInformation: false})}}
          onSuccess={e => {this.setState({renderSponsorInformation: false})}}
          api={this.props.api}
          i18next={this.props.i18next}
        />}
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