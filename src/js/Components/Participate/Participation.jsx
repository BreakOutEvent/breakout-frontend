import React from 'react';
import ParticipationForm from './ParticipationForm.jsx';

export default class Participation extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      participationError: null,
      isSubmitting: false
    };
  }

  componentDidMount() {
    this.props.api.getMe()
      .then(me => this.me = me)
      .catch(this.onGetMeError.bind(this));
  }

  onGetMeError(error) {
    this.props.show('login');
  }

  onBeginSubmit() {
    this.setState({
      isSubmitting: true
    });
  }

  onEndSubmit() {
    this.setState({
      isSubmitting: true
    });
  }

  async onSubmit(data) {
    this.onBeginSubmit();
    await this.onSubmitImpl(data);
    this.onEndSubmit();
  }

  async onSubmitImpl(data) {
    const participantData = {
      firstname: data.formData.firstname,
      lastname: data.formData.lastname,
      gender: data.formData.gender,
      participant: {
        emergencynumber: data.formData.emergencynumber,
        tshirtsize: data.formData.tshirtSize,
        phonenumber: data.formData.phonenumber
      }
    };

    return this.props.api.becomeParticipant(this.me.id, participantData)
      .then(this.onParticipationSuccess.bind(this))
      .catch(this.onParticipationError.bind(this));
  }

  onParticipationSuccess(data) {
    this.props.show('createOrJoinTeam');
  }

  onParticipationError(error) {
    this.setState({
      participationError: error.message
    });
  }

  render() {
    return (
      <ParticipationForm i18next={this.props.i18next}
                         onSubmit={this.onSubmit.bind(this)}
                         isSubmitting={this.state.isSubmitting}
                         participationError={this.state.registrationError}
                         onError={() => {
                         }}
                         onChange={() => {
                         }}/>
    );
  }
}