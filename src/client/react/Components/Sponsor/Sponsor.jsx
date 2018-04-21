import React from 'react';
import {
  Step,
  Stepper,
  StepLabel,
  StepContent
} from 'material-ui/Stepper';
import PersonalInformationForm from './PersonalInformationForm.jsx';
import CompanyInformationForm from './CompanyInformationForm.jsx';
import routes from '../routes'

export default class Sponsor extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      formData: null,
      activeStep: 0,
      isSubmitting: false
    };
  }

  componentDidMount() {
    this.props.api.getMe()
      .then(me => this.me = me)
      .catch(this.onGetMeError.bind(this));
  }

  onGetMeError(_) {
    this.props.history.push(routes.login);
  }

  async onSubmit(data) {
    this.onBeginSubmit();
    await this.onSubmitImpl(data);
    this.onEndSubmit();
  }

  onBeginSubmit() {
    this.setState({
      isSubmitting: true,
      registrationError: undefined
    });
  }

  onEndSubmit() {
    this.setState({
      isSubmitting: false,
      activeStep: (this.state.registrationError ? this.state.activeStep : this.state.activeStep + 1)
    });
  }

  async onSubmitImpl(data) {
    try {
      let personalData = this.state.personalData;
      let companyData = data.formData;
      console.log(personalData, companyData);

      let sponsorData = {
        firstname: personalData.firstname,
        lastname: personalData.lastname,
        sponsor: {
          company: companyData.company,
          url: companyData.url,
          hidden: false,
          address: {
            street: personalData.street,
            housenumber: personalData.housenumber,
            city: personalData.city,
            zipcode: personalData.postcode,
            country: personalData.country
          }
        }
      };

      const sponsor = await this.props.api.becomeSponsor(this.me.id, sponsorData);

      if (companyData.logo) {
        // TODO: upload company logo
      }

      if (!sponsor) throw new Error('Sponsor creation failed!');

      await session.refreshSession(req);
    } catch (error) {
      this.onRegistrationError(error);
      return;
    }

    try {
      await this.props.api.updateUserData(account.id, {
        preferredLanguage: window.boUserLang
      });
    } catch (err) {
      console.warn('Failed to set preferredLanguage: ' + err.message);
    }
    // TODO: forward user
    return
  }

  onRegistrationError(error) {
    let message = error.message;
    if (error.response && error.response.status === 409) {
      message = this.props.i18next.t('client.login.registration_error_exists');
    }
    this.setState({
      registrationError: message
    });
  }

  render() {

    return (
      <div>
        <Stepper activeStep={this.state.activeStep} orientation='vertical'>
          <Step>
            <StepLabel>Persönliche Daten eingeben</StepLabel>
            <StepContent>
              <PersonalInformationForm
                i18next={this.props.i18next}
                onSubmit={(data) => {
                  this.setState({personalData: data.formData, activeStep: this.state.activeStep + 1},);
                }}/>
            </StepContent>
          </Step>
          <Step>
            <StepLabel>Spender- oder Sponsordaten eingeben</StepLabel>
            <StepContent>
              <CompanyInformationForm
                i18next={this.props.i18next}
                isSubmitting={this.state.isSubmitting}
                onSubmit={this.onSubmit.bind(this)}
                errorMessage={this.state.registrationError}/>
            </StepContent>
          </Step>
          <Step>
            <StepLabel>Fertig</StepLabel>
            <StepContent>
              Vielen Dank, dass sie sich als Unterstützer registriert haben. Unter XYZ können Sie nun abcd machen
            </StepContent>
          </Step>
        </Stepper>
      </div>
    );
  }
}
