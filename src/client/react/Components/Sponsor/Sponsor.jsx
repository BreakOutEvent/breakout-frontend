import React from 'react';
import {
  Step,
  Stepper,
  StepLabel,
  StepContent
} from 'material-ui/Stepper';
import PersonalInformationForm from './PersonalInformationForm.jsx';
import CompanyInformationForm from './CompanyInformationForm.jsx';

export default class Sponsor extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      formData: null,
      activeStep: 0,
      isSubmitting: false
    };
  }

  onSubmit(data) {
    let companyData = data.formData;

    try {
      registerSponsor(data)
    } catch (err) {
      // handle error
    }

    this.setState({
      activeStep: activeStep + 1
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
            <StepLabel>Spender oder Sponsordaten eingeben</StepLabel>
            <StepContent>
              <CompanyInformationForm
                i18next={this.props.i18next}
                isSubmitting={this.state.isSubmitting}
                onSubmit={this.onSubmit.bind(this)}/>
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
