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
      personalData: null,
      activeStep: 0,
      isSubmitting: false
    };
  }

  componentDidMount() {
    this.props.api.getMe()
      .then(me => { this.setState({
        me,
        personalData: {
          firstname: me.firstname,
          lastname: me.lastname
        }
      });})
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
      let sponsorData = {
        firstname: personalData.firstname,
        lastname: personalData.lastname,
        preferredLanguage: window.boUserLang,
        sponsor: {
          supporterType: companyData.supporterType,
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

      // upload company logo to Cloudinary
      if (companyData.logo) {
        const signedParams = await this.props.api.signCloudinaryParams();

        const upload = await this.props.api.uploadImage(companyData.logo, signedParams);
        sponsorData.sponsor.logo = {
          type: 'IMAGE',
          url: upload.secure_url
        };
      }

      const sponsor = await this.props.api.updateUserData(this.state.me.id, sponsorData);
      if (!sponsor) throw new Error('Sponsor creation failed!');
    } catch (error) {
      this.onRegistrationError(error);
      return;
    }
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
    const t = content => this.props.i18next.t(`client.sponsor.${content}`)
    return (
      <div>
        <h1>{t('title')}</h1>
        {(!this.state.personalData
          ? <div className={'loading'}>{t('isLoadingMe')}...</div>
          : <Stepper activeStep={this.state.activeStep} orientation='vertical'>
            <Step>
              <StepLabel>{t('personalData')}</StepLabel>
              <StepContent>
                <PersonalInformationForm
                  i18next={this.props.i18next}
                  formData={this.state.personalData}
                  onSubmit={data => { this.setState({
                    personalData: data.formData,
                    activeStep: this.state.activeStep + 1
                  });}}/>
              </StepContent>
            </Step>
            <Step>
              <StepLabel>{t('supporterData.title')}</StepLabel>
              <StepContent>

                <CompanyInformationForm
                  i18next={this.props.i18next}
                  isSubmitting={this.state.isSubmitting}
                  onSubmit={this.onSubmit.bind(this)}
                  onBack={() => {this.setState({activeStep: this.state.activeStep - 1})}}
                  errorMessage={this.state.registrationError}/>
              </StepContent>
            </Step>
            <Step>
              <StepLabel>{t('finishTitle')}</StepLabel>
              <StepContent>
                {t('finishContent')} <a href="/settings/sponsoring">Sponsorings</a>
              </StepContent>
            </Step>
          </Stepper>)}
      </div>
    );
  }
}
