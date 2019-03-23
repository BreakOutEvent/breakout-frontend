import React from 'react';
import { TextField, Dialog, DialogTitle, DialogContent, Button, FormHelperText, DialogActions, Typography, withMobileDialog } from '@material-ui/core';
import PropTypes from 'prop-types';

const DONOR = 'DONOR';
const PASSIVE = 'PASSIVE';
const ACTIVE = 'ACTIVE';

class SponsorInformation extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      errors: [],
      showCompany: false,
    }
    this.updateInformation = this.updateInformation.bind(this);
    this.validateFirstname = this.validateFirstname.bind(this);
    this.validateLastname = this.validateLastname.bind(this);
    this.validateCompany = this.validateCompany.bind(this);
  }

  async componentWillMount() {
    const me = await this.props.api.getMe();
    this.setState({
      me,
      showCompany: (me.sponsor.supporterType !== DONOR)
    });
  }

  validateFirstname(name) {
   if (!name.length) {
      this.setState(state => ({errors: { ...state.errors, firstname: 'Bitte ausfüllen' }} ));
    } else {
      this.setState({errors: { ...this.state.errors, firstname: undefined }} );
      return true;
    }
    return false;
  }

  validateLastname(name) {
    if (this.state.me.sponsor.supporterType !== DONOR) {
      if (!name.length) {
        this.setState(state => ({errors: { ...state.errors, lastname: 'Bitte ausfüllen' }} ));
      } else {
        this.setState({errors: { ...this.state.errors, lastname: undefined }} );
        return true;
      }
      return false;
    }
    return true;
  }

  validateCompany(company) {
    if (this.state.me.sponsor.supporterType !== DONOR) {
      if (!company.length) {
        this.setState(state => ({errors: { ...state.errors, company: 'Bitte ausfüllen' }} ));
      } else {
        this.setState({errors: { ...this.state.errors, company: undefined }} );
        return true;
      }
      return false;
    }
    return true;
  }


  async updateInformation(e) {
    e.preventDefault();
    if(this.validateFirstname(this.state.me.firstname) &&
      this.validateLastname(this.state.me.lastname) &&
      this.validateCompany(this.state.me.sponsor.company)) {
      this.setState({errors: { information: undefined }});
    } else {
      return false;
    }

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
          {this.state.errors.information &&  <Typography variant="body1" color="error">Bitte Fehler beheben.</Typography>}
          <Typography>Um ein Team zu unterstützen benötigen wir noch Informationen über dich.</Typography>
          {this.state.me && <div>
            <TextField
              value={this.state.me.firstname}
              label="Vorname"
              required
              onChange={event => {
                event.persist();
                this.setState(state => ({me: {...state.me, firstname: event.target.value}}));
                this.validateFirstname(event.target.value);
              }}
            />{this.state.errors.firstname &&
          <FormHelperText id="component-error-text">{this.state.errors.firstname}</FormHelperText>
          }&nbsp;
            <TextField
              value={this.state.me.lastname}
              label="Nachname"
              required={this.state.showCompany}
              onChange={event => {
                event.persist();
                this.setState(state => ({me: {...state.me, lastname: event.target.value}}));
                this.validateLastname(event.target.value);
              }}
            />{this.state.errors.lastname &&
          <FormHelperText id="component-error-text">{this.state.errors.lastname}</FormHelperText>
          }<br /><br />
            {!this.state.showCompany && <Button onClick={e=>this.setState({showCompany: true})}>
              Als Firma unterstützen
            </Button>}
            {this.state.showCompany && <Button onClick={e=>
              this.setState(state => {
                let nextState = state;
                nextState.showCompany = false;
                nextState.me.sponsor.logo = null;
                nextState.me.sponsor.company = null;
                nextState.me.sponsor.url = null;
                nextState.me.sponsor.supporterType = DONOR;
                return nextState;
              })}>
              Als Privatperson unterstützen
            </Button>}
            {this.state.showCompany && <div>
              <TextField
                value={this.state.me.sponsor.company}
                label="Firmenname"
                required
                onChange={event => {
                  event.persist();
                  this.setState(state => ({me: {...state.me, sponsor: {...state.sponsor, company: event.target.value}}}));
                  this.validateCompany(event.target.value);
                }}
              />{this.state.errors.company &&
            <FormHelperText id="component-error-text">{this.state.errors.company}</FormHelperText>
            }
            </div>}
          </div>}
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