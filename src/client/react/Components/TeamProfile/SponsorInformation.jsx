import React from 'react';
import { TextField, Checkbox, FormControlLabel, Dialog, DialogTitle, DialogContent, Button, FormHelperText,
  DialogActions, Typography, withMobileDialog, Paper, IconButton, withStyles, CircularProgress
} from '@material-ui/core';
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
    this.validateLogo = this.validateLogo.bind(this);
    this.setAddress = this.setAddress.bind(this);
    this.determineSupporterType = this.determineSupporterType.bind(this);
    this.updateInformation = this.updateInformation.bind(this);
    this.t = (literal) => props.i18next.t(`client.sponsor.${literal}`);
  }

  async componentWillMount() {
    const me = await this.props.api.getMe();
    me.firstname = (me.firstname ? me.firstname : '');
    me.lastname = (me.lastname ? me.lastname : '');
    me.sponsor.url = (me.sponsor.url ? me.sponsor.url : '');
    me.sponsor.supporterType = (me.sponsor.supporterType ? me.sponsor.supporterType : DONOR);
    this.setState({
      me,
      showCompany: (me.sponsor.supporterType !== DONOR),
      lockSupporterType: (me.sponsor.supporterType !== DONOR),
    });
  }

  determineSupporterType() {
    if (!this.state.lockSupporterType) {
      this.setState(state => {
        let newState = state;
        newState.me.sponsor.supporterType = (state.me.sponsor.logo
          ? (state.me.sponsor.url
            ? ACTIVE : PASSIVE)
          : DONOR);
        return newState;
      })
    }
  }

  validateLogo(logo) {
    this.determineSupporterType();
    if(logo && logo.type) {
      if (logo.type.toLowerCase().indexOf('image') === -1) {
        this.setState(state => ({errors: { ...state.errors, logo: this.t('errorNoImage') }} ));
      } else {
        this.setState({errors: { ...this.state.errors, logo: undefined }} );
        return true;
      }
      return false;
    }
    return true;
  }

  setAddress(part) {
    return (event) => {
      event.persist();
      this.setState(state => ({
        me:
          {
            ...state.me, sponsor:
              {
                ...state.me.sponsor, address:
                  {...state.me.sponsor.address, [part]: event.target.value}
              }
          }
      }));
    }
  }

  async updateInformation(event) {
    event.preventDefault();
    const me = this.state.me;

    if (this.state.errors.logo) return false;
    this.setState({isSaving: true});

    try {
      if (me.sponsor.logo && me.sponsor.logo.name) {
        const logo = await new Promise((resolve) => {
          let fileReader = new FileReader();
          fileReader.onload = (_) => resolve(fileReader.result);
          fileReader.readAsDataURL(me.sponsor.logo);
        });
        const signedParams = await this.props.api.signCloudinaryParams();
        const upload = await this.props.api.uploadImage(logo, signedParams);
        me.sponsor.logo = {
          type: 'IMAGE',
          url: upload.secure_url
        };
      }

      const updatedMe = await this.props.api.updateUserData(me.id, {
        firstname: me.firstname,
        lastname: me.lastname,
        sponsor: {
          supporterType: me.sponsor.supporterType,
          company: me.sponsor.company,
          logo: me.sponsor.logo,
          url: (me.sponsor.url ? me.sponsor.url : null),
          address: me.sponsor.address
        }
      });
      if (!updatedMe) throw new Error('Information update failed!');
      this.props.onSuccess();
    } catch (error) {
      console.log(error);
      this.setState({errors: { information: error }, isSaving: false});
    }
  }

  render() {
    const logo = this.state.me && this.state.me.sponsor.logo;
    const width = 'calc(50% - 10px)';
    const styles = {
      introduction: {
        marginBottom: '10px'
      },
      leftInput: {
        width,
        marginRight: '15px',
        marginTop: '10px',
      },
      rightInput: {
        width,
        marginTop: '10px',
      },
      logo: {
        marginLeft: '0',
        marginBottom: '10px',
        marginTop: '10px',
      },
      logoPreview: {
        maxHeight: '75px',
        margin: '10px',
      }
    }
    const type = this.state.me && this.state.me.sponsor.supporterType.toLowerCase();

    return <Dialog
      open={true}
      fullScreen={this.props.fullScreen}
      onClose={this.props.onCancel}
    >
      <form onSubmit={this.updateInformation}>
        <DialogTitle id="login-register">{this.t('titleEdit')}</DialogTitle>
        <DialogContent>
          <Typography style={styles.introduction}>{this.t('profileNote')}</Typography>
          {this.state.me && <div>
            <TextField
              value={this.state.me.firstname}
              label={this.t('firstname')}
              required
              error={!!this.state.errors.firstname}
              style={styles.leftInput}
              onChange={event => {
                event.persist();
                this.setState(state => ({me: {...state.me, firstname: event.target.value}}));
              }}
            />&nbsp;
            <TextField
              value={this.state.me.lastname}
              label={this.t('lastname')}
              required={this.state.showCompany}
              error={!!this.state.errors.lastname}
              style={styles.rightInput}
              onChange={event => {
                event.persist();
                this.setState(state => ({me: {...state.me, lastname: event.target.value}}));
              }}
            /><br />
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
                    nextState.me.sponsor.logo = null;
                    nextState.me.sponsor.company = '';
                    nextState.me.sponsor.url = '';
                    nextState.me.sponsor.address = {
                      street: '',
                      housenumber: '',
                      city: '',
                      zipcode: '',
                      country: ''
                    };
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
              label={this.t('supportAsCompany')}
            />
            {this.state.showCompany && <div>
              <TextField
                value={this.state.me.sponsor.company}
                label={this.t('company')}
                error={!!this.state.errors.company}
                required
                style={styles.leftInput}
                onChange={event => {
                  event.persist();
                  this.setState(state => ({me: {...state.me, sponsor: {...state.me.sponsor, company: event.target.value}}}));
                  this.determineSupporterType();
                }}
              />&nbsp;
              {((this.state.me.sponsor.supporterType === ACTIVE) || !this.state.lockSupporterType) && <TextField
                value={this.state.me.sponsor.url}
                label={this.t('url')}
                style={styles.rightInput}
                onChange={event => {
                  event.persist();
                  this.setState(state => ({me: {...state.me, sponsor: {...state.me.sponsor, url: event.target.value}}}));
                  this.determineSupporterType();
                }}
              />}<br />
              <FormControlLabel
                style={styles.logo}
                control={
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    type="file"
                    onChange={event => {
                      event.persist();
                      this.setState(state => ({me: {...state.me, sponsor: {...state.me.sponsor, logo: event.target.files[0]}}}));
                      this.validateLogo(event.target.files[0]);
                    }}
                  />}
                label={<Button style={{width: '100%'}} variant="contained" component="span">
                  {this.t('uploadLogo')}
                </Button>} />
              {logo && logo.name && <span>{logo.name.substr(logo.name.lastIndexOf('\\')+1)}</span>}
              {logo && logo.url && <img src={logo.url} style={styles.logoPreview} />}
              {logo && <IconButton onClick={event => {
                event.persist();
                this.setState(state => ({me: {...state.me, sponsor: {...state.me.sponsor, logo: null}}}));
              }} aria-label="Delete">
                <DeleteIcon fontSize="small" />
              </IconButton>}
              {this.state.errors.logo &&
              <FormHelperText id="component-error-text">{this.state.errors.logo}</FormHelperText>
              }
              <br />
              <TextField
                value={this.state.me.sponsor.address.street}
                label={this.t('street')}
                required
                style={styles.leftInput}
                onChange={this.setAddress('street')}
              />&nbsp;
            <TextField
              value={this.state.me.sponsor.address.housenumber}
              label={this.t('housenumber')}
              required
              style={styles.rightInput}
              onChange={this.setAddress('housenumber')}
            /><br />
            <TextField
              value={this.state.me.sponsor.address.zipcode}
              label={this.t('postcode')}
              required
              style={styles.leftInput}
              onChange={this.setAddress('zipcode')}
              />&nbsp;
            <TextField
              value={this.state.me.sponsor.address.city}
              label={this.t('city')}
              required
              style={styles.rightInput}
              onChange={this.setAddress('city')}
              /><br />
            <TextField
              value={this.state.me.sponsor.address.country}
              label={this.t('country')}
              required
              style={styles.leftInput}
              onChange={this.setAddress('country')}
              />
            </div>}<br />
            <Paper style={{padding: "10px"}}>
              <Typography variant="subtitle1">
                {this.t('donate_as')}: {this.t(`supporterData.${type}.title`)}
              </Typography>
              <Typography variant="body2">
                {this.t(`supporterData.${type}.description`)}
              </Typography>
            </Paper>
          </div>}
        </DialogContent>
        <DialogActions style={{justifyContent: 'flex-end'}}>
          <Button onClick={this.props.onCancel} color="primary">
            {this.t('cancel')}
          </Button>
          <Button type="submit" color="primary">
            {this.t('continue')}
          </Button>
          {this.state.isSaving && <CircularProgress size={24} thickness={5} />}
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