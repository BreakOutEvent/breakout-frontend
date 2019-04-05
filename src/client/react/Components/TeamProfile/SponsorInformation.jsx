import React from 'react';
import { TextField, Checkbox, FormControlLabel, Dialog, DialogTitle, DialogContent, Button, FormHelperText,
  DialogActions, Typography, withMobileDialog, Paper, IconButton, withStyles } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import PropTypes from 'prop-types';

const DONOR = 'DONOR';
const PASSIVE = 'PASSIVE';
const ACTIVE = 'ACTIVE';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
});

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
    this.validateLogo = this.validateLogo.bind(this);
    this.validateStreet = this.validateStreet.bind(this);
    this.validateHousenumber = this.validateHousenumber.bind(this);
    this.validateZipcode = this.validateZipcode.bind(this);
    this.validateCity = this.validateCity.bind(this);
    this.validateCountry = this.validateCountry.bind(this);
    this.determineSupporterType = this.determineSupporterType.bind(this);
    this.deleteLogo = this.deleteLogo.bind(this);
  }

  async componentWillMount() {
    const me = await this.props.api.getMe();
    me.firstname = (me.firstname ? me.firstname : '');
    me.lastname = (me.lastname ? me.lastname : '');
    me.sponsor.supporterType = (me.sponsor.supporterType ? me.sponsor.supporterType : DONOR);
    this.setState({
      me,
      showCompany: (me.sponsor.supporterType !== DONOR),
      lockSupporterType: (me.sponsor.supporterType !== DONOR),
    });
  }

  deleteLogo(event) {
    event.persist();
    this.setState(state => ({me: {...state.me, sponsor: {...state.me.sponsor, logo: {}}}}));
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
    if (!this.state.lockSupporterType) {
      this.setState(state => {
        let newState = state;
        newState.me.sponsor.supporterType = (state.me.sponsor.company ? (state.me.sponsor.url ? ACTIVE : PASSIVE) : DONOR);
        return newState;
      })
    }
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

  validateLogo(logo) {
    this.determineSupporterType();
    if(logo && logo.type) {
      if (logo.type.toLowerCase().indexOf('image') === -1) {
        this.setState(state => ({errors: { ...state.errors, logo: 'Bitte ein Bild auswählen' }} ));
      } else {
        this.setState({errors: { ...this.state.errors, logo: undefined }} );
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
      this.validateLogo(me.sponsor.logo) &&
      validateAddress) {
      this.setState({errors: { information: undefined }});
    } else {
      return false;
    }

    try {
      if (me.sponsor.logo && me.sponsor.logo.name) {
        me.sponsor.logo = await new Promise((resolve) => {
          let fileReader = new FileReader();
          fileReader.onload = (e) => resolve(fileReader.result);
          fileReader.readAsDataURL(me.sponsor.logo );
        });
        const signedParams = await this.props.api.signCloudinaryParams();
        const upload = await this.props.api.uploadImage(me.sponsor.logo, signedParams);
        me.sponsor.logo = {
          type: 'IMAGE',
          url: upload.secure_url
        };
      } else {
        me.sponsor.logo = undefined;
      }

      const updatedMe = await this.props.api.updateUserData(me.id, me);
      if (!updatedMe) throw new Error('Information update failed!');
      me.sponsor.logo = (me.sponsor.logo ? me.sponsor.logo : {});
      this.props.onSuccess();
    } catch (error) {
      console.log(error);
      this.setState({errors: { information: error }});;
    }
  }

  render() {
    const logo = this.state.me && this.state.me.sponsor.logo;
    const width = 'calc(50% - 10px)';
    const styles = {
      leftInput: {
        width,
        marginRight: '16px'
      },
      rightInput: {
        width
      },
      logo: {
        marginLeft: '0'
      }
    }
    return <Dialog
      open={true}
      fullScreen={this.props.fullScreen}
      onClose={this.props.onCancel}
    >
      <form onSubmit={this.updateInformation}>
        <DialogTitle id="login-register">Sponsorinformationen</DialogTitle>
        <DialogContent>
          {this.state.errors.information &&  <Typography variant="body1" color="error">Bitte Fehler beheben.</Typography>}
          <Typography>Um ein Team zu unterstützen, benötigen wir diese Informationen über dich.</Typography>
          {this.state.me && <div>
            <TextField
              value={this.state.me.firstname}
              label="Vorname"
              required
              style={styles.leftInput}
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
              style={styles.rightInput}
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
              disabled={this.state.lockSupporterType}
              onChange={e => {
                e.persist();
                this.setState(state => {
                  let nextState = state;
                  nextState.showCompany = e.target.checked;
                  if (e.target.checked) {
                    nextState.me.sponsor.logo = {};
                    nextState.me.sponsor.company = '';
                    nextState.me.sponsor.url = '';
                    nextState.me.sponsor.address = {
                      street: '',
                      housenumber: '',
                      city: '',
                      zipcode: '',
                      country: ''};
                  } else {
                    nextState.me.sponsor.supporterType = DONOR;
                    nextState.me.sponsor.logo = null;
                    nextState.me.sponsor.company = null;
                    nextState.me.sponsor.url = null;
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
                style={styles.leftInput}
                onChange={event => {
                  event.persist();
                  this.setState(state => ({me: {...state.me, sponsor: {...state.me.sponsor, company: event.target.value}}}));
                  this.validateCompany(event.target.value);
                }}
              />{this.state.errors.company &&
            <FormHelperText id="component-error-text">{this.state.errors.company}</FormHelperText>
            }&nbsp;
              {(this.state.me.sponsor.url || !this.state.lockSupporterType) && <TextField
                value={this.state.me.sponsor.url}
                label="Webseite"
                style={styles.rightInput}
                onChange={event => {
                  event.persist();
                  this.setState(state => ({me: {...state.me, sponsor: {...state.me.sponsor, url: event.target.value}}}));
                  this.validateUrl(event.target.value);
                }}
              />}{this.state.errors.url &&
            <FormHelperText id="component-error-text">{this.state.errors.url}</FormHelperText>
            }<br /><br />
              <FormControlLabel
                style={styles.logo}
                control={
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    type="file"
                    onChange={event => {
                      event.persist();
                      this.setState(state => ({me: {...state.me, sponsor: {...state.me.sponsor, logo: event.target.files[0]}}}));
                      this.validateLogo(event.target.files[0]);
                    }}
                  />}
                label={<Button style={{width: '100%'}} variant="contained" component="span">
                  Logo hochladen
                </Button>} />
              {logo && logo.name && <span>{logo.name.substr(logo.name.lastIndexOf('\\')+1)}</span>}
              {logo && logo.url && <img src={logo.url} style={{maxHeight: '100px'}} />}
              {logo && (logo.name || logo.url) && <IconButton onClick={this.deleteLogo} aria-label="Delete">
                <DeleteIcon fontSize="small" />
              </IconButton>}
              {this.state.errors.logo &&
              <FormHelperText id="component-error-text">{this.state.errors.logo}</FormHelperText>
              }
              <br />
              <TextField
                value={this.state.me.sponsor.address.street}
                label="Straße"
                required
                style={styles.leftInput}
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
              style={styles.rightInput}
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
              style={styles.leftInput}
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
              style={styles.rightInput}
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
              style={styles.leftInput}
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
            </div>}<br />
            {(this.state.me.sponsor.supporterType === ACTIVE) && <Paper style={{padding: "10px"}}>
              <Typography variant="subtitle1">
                Sie sind: {this.props.i18next.t('client.sponsor.supporterData.active.title')}
              </Typography>
              <Typography variant="body2">
                {this.props.i18next.t('client.sponsor.supporterData.active.description')}
              </Typography>
            </Paper>}
            {(this.state.me.sponsor.supporterType === PASSIVE) && <Paper style={{padding: "10px"}}>
              <Typography variant="subtitle1">
                Sie sind: {this.props.i18next.t('client.sponsor.supporterData.passive.title')}
              </Typography>
              <Typography variant="body2">
                {this.props.i18next.t('client.sponsor.supporterData.passive.description')}
              </Typography>
            </Paper>}
            {(this.state.me.sponsor.supporterType === DONOR) && <Paper style={{padding: "10px"}}>
              <Typography variant="subtitle1">
                Sie sind: {this.props.i18next.t('client.sponsor.supporterData.donor.title')}
              </Typography>
              <Typography variant="body2">
                {this.props.i18next.t('client.sponsor.supporterData.donor.description')}
              </Typography>
            </Paper>}
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

export default withMobileDialog()(withStyles(styles)(SponsorInformation));