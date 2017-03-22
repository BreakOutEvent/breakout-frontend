import {
  Modal,
} from 'react-bootstrap';

import React from 'react';
import i18next from 'i18next';
import RegistrationHeader from './RegistrationHeader.jsx';

import de from '../../../resources/translations/translations.de.js';
import en from '../../../resources/translations/translations.en.js';

i18next.init({
  lng: window.getBoUserLang(),
  fallbackLng: 'de',
  resources: {
    de: {
      translation: de
    },
    en: {
      translation: en
    }
  }
});


export default class RoleSelector extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  onClick(e) {
    this.setState({
      selectedRole: e.currentTarget.id
    });
    this.next(e.currentTarget.id);
  }

  next(selectedRole) {
    if (selectedRole === 'visitor') {
      this.props.next(this.props.steps.done)
    } else if (selectedRole === 'participant') {
      this.props.next(this.props.steps.becomeParticipant)
    } else if (selectedRole === 'sponsor') {
      alert("Not implemented yet!");
    }
  }

  render() {

    return (
      <Modal
        show={this.props.visible}
        onHide={this.props.onHide}
        bsSize="small">
        <RegistrationHeader
          title={i18next.t('client.role_select.headline')}
          description={i18next.t('client.role_select.description')}/>

        <Modal.Body>

          <Selector roleTitle={i18next.t('client.role_select.visitor_title')}
                    roleText={i18next.t('client.role_select.visitor_text')}
                    role="visitor"
                    onClick={this.onClick.bind(this)}/>

          <Selector roleTitle={i18next.t('client.role_select.participant_title')}
                    roleText={i18next.t('client.role_select.participant_text')}
                    role="participant"
                    onClick={this.onClick.bind(this)}/>

          <Selector roleTitle={i18next.t('client.role_select.sponsor_title')}
                    roleText={i18next.t('client.role_select.sponsor_text')}
                    role="sponsor"
                    onClick={this.onClick.bind(this)}/>

        </Modal.Body>

      </Modal>
    );
  }
}

const Selector = (props) => {

  const style = `
    .roleSelector .btn-primary {
      width: 100%;
      background: transparent;
      color: #000000;
      border-radius: 9px;
      border-width: 2px;
      border-color: grey;
      text-align: left;
      margin-bottom: 10px;
      white-space: normal;
    }
    
    .roleSelector .btn-primary:hover {
      background-color: transparent;
      border-color: #e6823c;
      color: #000000;
    }
    
    .roleSelector .btn-primary:active {
      background-color: transparent;
      border-color: #e6823c;
      color: #000000;
    }
    
    .roleSelector .btn-primary:focus {
      background-color: transparent;
      border-color: #e6823c;
      color: #000000;
    }
    
    .roleSelector .btn-primary h3 {
       margin-bottom: 10px;
       margin-top: 4px;
       font-size: large;
       font-weight: bold; 
    }`;
  return (
    <div className="row roleSelector">
      <style>
        {style}
      </style>
      <div className="col-sm-12">
        <button className="btn btn-primary" id={props.role} onClick={props.onClick}>
          <h3>{props.roleTitle}</h3>
          <p>{props.roleText}</p>
        </button>
      </div>
    </div>
  );
};

