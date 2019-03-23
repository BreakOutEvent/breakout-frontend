import React from 'react';
import { TextField, Checkbox, FormControlLabel, Dialog, DialogTitle, DialogContent, Button, FormHelperText,
  DialogActions, Typography, withMobileDialog } from '@material-ui/core';
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
    this.validateUrl = this.validateUrl.bind(this);
    this.validateStreet = this.validateStreet.bind(this);
    this.validateHousenumber = this.validateHousenumber.bind(this);
    this.validateZipcode = this.validateZipcode.bind(this);
    this.validateCity = this.validateCity.bind(this);
    this.validateCountry = this.validateCountry.bind(this);
    this.determineSupporterType = this.determineSupporterType.bind(this);
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

  determineSupporterType() {
    this.setState(state => {
      let newState = state;
      newState.me.sponsor.supporterType = (state.me.sponsor.company ? (state.me.sponsor.url ? ACTIVE : PASSIVE) : DONOR);
      return newState;
    })
  }

  validateCompany(company) {
    this.determineSupporterType();
    if (this.state.me.sponsor.supporterType !== DONOR) {
      if (!company.length) {
        this.setState(state => ({errors: { ...state.errors, company: 'Bitte ausfüllen' }} ));
      } else {
        this.setState(state => ({errors: { ...state.errors, company: undefined }} ));
        return true;
      }
      return false;
    }
    return true;
  }

  validateUrl(url) {
    this.determineSupporterType();
    if (url) {
      if (!url.length) {
        this.setState(state => ({errors: { ...state.errors, url: 'Bitte ausfüllen' }} ));
      } else {
        this.setState({errors: { ...this.state.errors, url: undefined }} );
        return true;
      }
      return false;
    }
    return true;
  }

  validateStreet(value) {
    if (this.state.me.sponsor.supporterType !== DONOR) {
      if (!value.length) {
        this.setState(state => ({errors: { ...state.errors, street: 'Bitte ausfüllen' }} ));
      } else {
        this.setState(state => ({errors: { ...state.errors, street: undefined }} ));
        return true;
      }
      return false;
    }
    return true;
  }

  validateHousenumber(value) {
    if (this.state.me.sponsor.supporterType !== DONOR) {
      if (!value.length) {
        this.setState(state => ({errors: { ...state.errors, housenumber: 'Bitte ausfüllen' }} ));
      } else {
        this.setState(state => ({errors: { ...state.errors, housenumber: undefined }} ));
        return true;
      }
      return false;
    }
    return true;
  }

  validateZipcode(value) {
    if (this.state.me.sponsor.supporterType !== DONOR) {
      if (!value.length) {
        this.setState(state => ({errors: { ...state.errors, zipcode: 'Bitte ausfüllen' }} ));
      } else {
        this.setState(state => ({errors: { ...state.errors, zipcode: undefined }} ));
        return true;
      }
      return false;
    }
    return true;
  }

  validateCity(value) {
    if (this.state.me.sponsor.supporterType !== DONOR) {
      if (!value.length) {
        this.setState(state => ({errors: { ...state.errors, city: 'Bitte ausfüllen' }} ));
      } else {
        this.setState(state => ({errors: { ...state.errors, city: undefined }} ));
        return true;
      }
      return false;
    }
    return true;
  }

  validateCountry(value) {
    if (this.state.me.sponsor.supporterType !== DONOR) {
      if (!value.length) {
        this.setState(state => ({errors: { ...state.errors, country: 'Bitte ausfüllen' }} ));
      } else {
        this.setState(state => ({errors: { ...state.errors, country: undefined }} ));
        return true;
      }
      return false;
    }
    return true;
  }

  async updateInformation(e) {
    e.preventDefault();
    const me = this.state.me;
    const validateAddress = (me.sponsor.address
    ? this.validateStreet(me.sponsor.address.street) &&
      this.validateHousenumber(me.sponsor.address.housenumber) &&
      this.validateZipcode(me.sponsor.address.zipcode) &&
      this.validateCity(me.sponsor.address.city) &&
      this.validateCountry(me.sponsor.address.country)
    : true);

    if(this.validateFirstname(me.firstname) &&
      this.validateLastname(me.lastname) &&
      this.validateCompany(me.sponsor.company) &&
      this.validateUrl(me.sponsor.url) &&
      validateAddress) {
      this.setState({errors: { information: undefined }});
    } else {
      return false;
    }

    try {
      const updatedMe = await this.props.api.updateUserData(me.id, me);
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
          }<br />
            <FormControlLabel
              control={
            <Checkbox
              checked={this.state.showCompany}
              onChange={e => {
                e.persist();
                this.setState(state => {
                  let nextState = state;
                  nextState.showCompany = e.target.checked;
                  if (e.target.checked) {
                    nextState.me.sponsor.address = {
                      street: '',
                      housenumber: '',
                      city: '',
                      zipcode: '',
                      country: ''};
                  } else {
                    nextState.me.sponsor.supporterType = DONOR;
                    nextState.me.sponsor.logo = null;
                    nextState.me.sponsor.company = '';
                    nextState.me.sponsor.url = '';
                    nextState.me.sponsor.address = null;
                  }
                  return nextState;
                })
              }}
              color="primary"
            />}
              label="Als Firma unterstützen"
            />
            {this.state.showCompany && <div>
              <TextField
                value={this.state.me.sponsor.company}
                label="Firmenname"
                required
                onChange={event => {
                  event.persist();
                  this.setState(state => ({me: {...state.me, sponsor: {...state.me.sponsor, company: event.target.value}}}));
                  this.validateCompany(event.target.value);
                }}
              />{this.state.errors.company &&
            <FormHelperText id="component-error-text">{this.state.errors.company}</FormHelperText>
            }&nbsp;
              <TextField
                value={this.state.me.sponsor.url}
                label="Webseite"
                onChange={event => {
                  event.persist();
                  this.setState(state => ({me: {...state.me, sponsor: {...state.me.sponsor, url: event.target.value}}}));
                  this.validateUrl(event.target.value);
                }}
              />{this.state.errors.url &&
            <FormHelperText id="component-error-text">{this.state.errors.url}</FormHelperText>
            }<br />
              <TextField
                value={this.state.me.sponsor.address.street}
                label="Straße"
                required
                onChange={event => {
                  event.persist();
                  this.setState(state => ({
                    me:
                      {
                        ...state.me, sponsor:
                          {
                            ...state.me.sponsor, address:
                              {...state.me.sponsor.address, street: event.target.value}
                          }
                      }
                  }));
                  this.validateStreet(event.target.value);
                }}
              />{this.state.errors.street &&
            <FormHelperText id="component-error-text">{this.state.errors.street}</FormHelperText>
            }&nbsp;
            <TextField
              value={this.state.me.sponsor.address.housenumber}
              label="Nr."
              required
              onChange={event => {
                event.persist();
                this.setState(state => ({
                  me:
                    {
                      ...state.me, sponsor:
                        {
                          ...state.me.sponsor, address:
                            {...state.me.sponsor.address, housenumber: event.target.value}
                        }
                    }
                }));
                this.validateHousenumber(event.target.value);
            }}/>{this.state.errors.housenumber &&
              <FormHelperText id="component-error-text">{this.state.errors.housenumber}</FormHelperText>
            }<br />
            <TextField
              value={this.state.me.sponsor.address.zipcode}
              label="Postleitzahl"
              required
              onChange={event => {
                event.persist();
                this.setState(state => ({
                  me:
                    {
                      ...state.me, sponsor:
                        {
                          ...state.me.sponsor, address:
                            {...state.me.sponsor.address, zipcode: event.target.value}
                        }
                    }
                }));
                this.validateZipcode(event.target.value);
            }}
              />{this.state.errors.zipcode &&
            <FormHelperText id="component-error-text">{this.state.errors.zipcode}</FormHelperText>
            }&nbsp;
            <TextField
              value={this.state.me.sponsor.address.city}
              label="Stadt"
              required
              onChange={event => {
                event.persist();
                this.setState(state => ({
                  me:
                    {
                      ...state.me, sponsor:
                        {
                          ...state.me.sponsor, address:
                            {...state.me.sponsor.address, city: event.target.value}
                        }
                    }
                }));
              this.validateCity(event.target.value);
            }}
              />{this.state.errors.city &&
            <FormHelperText id="component-error-text">{this.state.errors.city}</FormHelperText>
            }<br />
            <TextField
              value={this.state.me.sponsor.address.country}
              label="Land"
              required
              onChange={event => {
                event.persist();
                this.setState(state => ({
                  me:
                    {
                      ...state.me, sponsor:
                        {
                          ...state.me.sponsor, address:
                            {...state.me.sponsor.address, country: event.target.value}
                        }
                    }
                }));
                this.validateCountry(event.target.value);
            }}
              />{this.state.errors.country &&
            <FormHelperText id="component-error-text">{this.state.errors.country}</FormHelperText>
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