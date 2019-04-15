import React from 'react';
import { Paper, TextField, Button, InputAdornment, FormHelperText, Typography, IconButton,
  Snackbar } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types';
import RegisterLogin from '../Register/RegisterLogin.jsx';
import SponsorPresentation from './SponsorPresentation.jsx';
import SponsorInformation from '../Sponsor/SponsorInformation.jsx';
import { styleChallenge } from './ListOfChallenges.jsx';

const style = styleChallenge('black');
style.title = {
  padding: '10px 10px 5px',
}
style.icon = {
  marginRight: 10,
  width: 50,
}
style.top.padding = 10;
style.top.flexWrap = "wrap";
style.inputLeft = {
  marginRight: 10,
  minWidth: 110,
  width: "calc(50% - 5px)",
};
style.inputRight = {
  width: "calc(50% - 5px)",
  maxWidth: "calc(100% - 120px)"
};
style.description.width = '100%';
style.buttons = {
  display: 'flex',
  justifyContent: 'flex-end'
}

class AddSponsoring extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      renderAll: false,
      renderRegisterLogin: false,
      renderSponsorInformation: false,
      amount: "0,10",
      limit: "",
      me: null,
      errors: {},
      isAdding: false,
      justAdded: false,
    };
    this.validate = this.validate.bind(this);
    this.onSuccessRegisterLogin = this.onSuccessRegisterLogin.bind(this);
    this.onSuccessSponsorInformation = this.onSuccessSponsorInformation.bind(this);
    this.addSponsoring = this.addSponsoring.bind(this);
    this.t = (content) => this.props.i18next.t(`client.sponsor.addSponsoring.${content}`);
  }

  async componentDidMount() {
    this.setState({
      me: await this.props.api.getMe()
    });
  }

  onSuccessRegisterLogin() {
    this.setState({
      renderRegisterLogin: false,
    });
    this.addSponsoring();
  }

  addSponsoring(event) {
    if(event) event.preventDefault();

    if (!this.validate('amount', this.state.amount)
        || !this.validate('limit', this.state.limit) ) return false;
    this.setState({isAdding: true});

    this.props.api.getMe()
      .then(me => {
        if(!me.firstname) {
          this.setState({renderSponsorInformation: true});
          return
        }

        this.props.api.addSponsoring(this.props.teamId,
          {
            limit: (this.state.limit ? this.state.limit.replace(',', '.') : 9999999999),
            amountPerKm: this.state.amount.replace(',', '.')
          })
          .then(response => {
            if(this.props.update) this.props.update(response.sponsorId);
            this.setState({isAdding: false, amount: "0,10", limit: "", justAdded: true});
          })})
      .catch(() => this.setState({renderRegisterLogin: true}));
  }

  validate(property, value) {
    let error = (property === 'limit' && value === ''
      ? undefined
      : (/^\d+[.,]?\d{0,2}$/.test(value)
        ? (parseFloat(value.replace(',', '.')) > 0
            ? undefined : true)
        : true
      )
    );
    this.setState(state => ({errors: { ...state.errors, [property]: error }} ));
    return !error;
  }

  async onSuccessSponsorInformation() {
    const me = await this.props.api.getMe();
    this.setState({renderSponsorInformation: false, me});
    this.props.update();
    if (this.state.isAdding) {
      this.addSponsoring();
    }
  }

  render() {
    const me = this.state.me;

    return <div>
      <Paper elevation={1} id="add-challenge">
        <form
          onFocus={e=>this.setState({renderAll: true})}
          onSubmit={this.addSponsoring}
        >
          <Typography variant="h6" style={style.title}>
            {this.t('title')}
          </Typography>
          <div style={style.top}>
            <TextField
              label={this.t('amount')}
              value={this.state.amount}
              onChange={e=>{this.setState({amount: e.target.value}); this.validate('amount', e.target.value);}}
              InputProps={{ endAdornment: <InputAdornment position="end">€</InputAdornment> }}
              error={this.state.errors.amount}
              style={style.inputLeft}
            />
            <TextField
              label={this.t('limit')}
              value={this.state.limit}
              onChange={e=>{this.setState({limit: e.target.value}); this.validate('limit', e.target.value);}}
              InputProps={{ endAdornment: <InputAdornment position="end">€</InputAdornment> }}
              error={this.state.errors.limit}
              style={style.inputRight}
            />
            <Typography variant="body2" style={{marginTop: 10}}>
              {this.t('privacyNote')}
            </Typography>
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

AddSponsoring.propTypes = {
  api: PropTypes.object.isRequired,
  teamId: PropTypes.number.isRequired,
  i18next: PropTypes.object.isRequired,
};

export default AddSponsoring;