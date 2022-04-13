import React from 'react';
import ParticipationForm from './ParticipationForm.jsx';
import Breadcrumbs from '../Breadcrumb.jsx';
import routes from '../routes';
import PropTypes from 'prop-types';

export default class Participation extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      participationError: null,
      isSubmitting: false,
      tshirtSizes: ['S', 'M', 'L', 'XL'],
      formData: null
    };
  }

  componentDidMount() {
    this.props.api.getMe()
      .then(me => {
        this.me = me;
        const participant = me.participant || {};
        this.setState({
          formData: {
            ...participant,
            firstname: me.firstname,
            lastname: me.lastname
          }
        });
      })
      .catch(this.onGetMeError.bind(this));
  }

  onGetMeError(error) {
    this.props.history.push(routes.login);
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
      },
      newsletter: this.me.newsletter
    };

    return this.props.api.becomeParticipant(this.me.id, participantData)
      .then(this.onParticipationSuccess.bind(this))
      .catch(this.onParticipationError.bind(this));
  }

  onParticipationSuccess() {
    this.props.history.push(routes.createOrJoinTeam);
  }

  onParticipationError(error) {
    this.setState({
      participationError: error.message
    });
  }

  onChange({ formData }) {
    this.setState({
      formData
    });
  }

  render() {

    const entries = [{
      title: this.props.i18next.t('client.breadcrumbs.role_select'),
      isActive: false,
      link: routes.selectRole
    }, {
      title: this.props.i18next.t('client.breadcrumbs.participate'),
      isActive: true,
      link: '#'
    }];

    return (
      <div>
        <Breadcrumbs entries={entries}/>
        <ParticipationForm i18next={this.props.i18next}
                           onSubmit={this.onSubmit.bind(this)}
                           isSubmitting={this.state.isSubmitting}
                           participationError={this.state.registrationError}
                           tshirtSizes={this.state.tshirtSizes}
                           formData={this.state.formData}
                           onError={() => {
                           }}
                           onChange={this.onChange.bind(this)}/>
      </div>
    );
  }
}

Participation.propTypes = {
  api: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  i18next: PropTypes.object.isRequired,
};
