import BreakoutApi from '../BreakoutApi';
import React from 'react';
import {Button, ButtonGroup, Row, Col, Checkbox, Modal} from 'react-bootstrap';
import {TextInput, OptionsInput} from './Inputs.jsx';
import {CenterButton} from './Buttons.jsx';
import store from 'store';
import RegistrationHeader from './RegistrationHeader.jsx';
import i18next from 'i18next';
import de from '../../../resources/translations/translations.de';
import en from '../../../resources/translations/translations.de';

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

export default class BecomeParticipant extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: true
    };
  }

  componentDidMount() {
    if (!store.get('tokens')) {
      this.props.transitionTo(this.props.steps.login);
    }
  }

  hide() {
    this.setState({
      visible: false
    });
  }

  handleChange(event) {

    const target = event.target;
    let value = '';

    if (target.type === 'select-one') {
      value = target.options[target.selectedIndex].text;
    }
    else if (target.type === 'checkbox') {
      value = target.checked;
    }
    else {
      value = target.value;
    }

    const id = target.id;

    this.setState({
      [id]: value
    });
  }

  selectGender(event) {
    const target = event.target;
    const id = target.id;
    this.setState({
      gender: id
    });
  }

  getStyleForGender(gender) {
    if (this.state.gender === gender) {
      return 'btn-primary';
    } else {
      return '';
    }
  }

  async register() {

    const toValidate = ['firstname', 'lastname', 'tshirtSize', 'contactNumber',
      'emergencyNumber', 'acceptsTos', 'acceptsCodeOfHonour', 'is18', 'gender'];

    for (let elem of toValidate) {
      if (!this.isValid(elem)) {
        // TODO: l10n
        this.displayError(i18next.t('client.participate.enter_full_data') + '. Missing ' + elem);
        return Promise.resolve();
      }
    }

    const userData = {
      firstname: this.state.firstname,
      lastname: this.state.lastname,
      participant: {
        tshirtsize: this.state.tshirtSize,
        phonenumber: this.state.contactNumber,
        emergencynumber: this.state.emergencyNumber
      }
    };

    let api = await BreakoutApi.initFromServer();

    const tokens = store.get('tokens');

    if (!tokens) {
      this.props.transitionTo(this.props.steps.login);
    } else {
      api.setAccessToken(tokens.access_token);

      try {
        const me = await api.getMe();
        await api.becomeParticipant(me.id, userData);
        this.props.transitionTo(this.props.steps.createOrJoinTeam);

      } catch (err) {
        this.handleError(err);
      }
    }
  }

  handleError(err) {
    try {
      if (err.response.status === 400) {
        this.displayError(i18next.t('client.participate.enter_full_data'));
      } else if (err.response.status === 401) {
        this.props.transitionTo(this.props.steps.login);
      } else {
        this.displayError(err.message);
      }
    } catch (err) {
      this.displayError(err.message);
    }
  }

  isValid(elem) {
    const notNull = (elem) => !!elem;
    const notEmpty = (elem) => elem !== '';
    const checked = (elem) => elem;
    const and = (f1, f2) => (elem) => (f1(elem) && f2(elem));

    const validationRules = {
      firstname: and(notNull, notEmpty),
      lastname: and(notNull, notEmpty),
      gender: notNull,
      tshirtSize: notNull,
      contactNumber: and(notNull, notEmpty),
      emergencyNumber: and(notNull, notEmpty),
      acceptsTos: checked,
      acceptsCodeOfHonour: checked,
      is18: checked
    };

    if (!validationRules[elem]) {
      throw new Error('No validation rule for ' + elem);
    }

    return validationRules[elem](this.state[elem]);
  }

  displayError(message) {
    this.setState({
      errorMessage: message
    });
  }

  getTshirtSizes() {
    return ['Select size', 'S', 'M', 'L', 'XL'];
  }

  render() {
    return (
      <Modal show={this.props.visible} onHide={this.props.hide}>
        <RegistrationHeader title={i18next.t('client.participate.title')}
                            description={i18next.t('client.participate.description')}/>
        <Modal.Body>

          <Row style={{textAlign: 'center'}}>
            <Col sm={12}>
              <ButtonGroup>
                <Button id="male" onClick={this.selectGender.bind(this)}
                        className={this.getStyleForGender('male')}>
                  {i18next.t('client.participate.male')}
                </Button>
                <Button id="female" onClick={this.selectGender.bind(this)}
                        className={this.getStyleForGender('female')}>
                  {i18next.t('client.participate.female')}
                </Button>
              </ButtonGroup>
            </Col>
          </Row>

          <TextInput id='firstname' isValid={this.isValid.bind(this)}
                     value={this.state.firstname || ''}
                     placeholder={i18next.t('client.participate.firstname.placeholder')}
                     label={i18next.t('client.participate.firstname.label')}
                     onChange={this.handleChange.bind(this)}/>

          <TextInput id='lastname' isValid={this.isValid.bind(this)}
                     value={this.state.lastname || ''}
                     placeholder={i18next.t('client.participate.lastname.placeholder')}
                     label={i18next.t('client.participate.lastname.label')}
                     onChange={this.handleChange.bind(this)}/>

          <OptionsInput id='tshirtSize' isValid={this.isValid.bind(this)}
                        label={i18next.t('client.participate.tshirtsize.label')}
                        onChange={this.handleChange.bind(this)} values={this.getTshirtSizes()}/>

          <TextInput id='contactNumber' isValid={this.isValid.bind(this)}
                     value={this.state.contactNumber || ''}
                     label={i18next.t('client.participate.contactnumber.label')}
                     onChange={this.handleChange.bind(this)}
                     placeholder={i18next.t('client.participate.contactnumber.placeholder')}/>

          <TextInput id='emergencyNumber' isValid={this.isValid.bind(this)}
                     value={this.state.emergencyNumber || ''}
                     onChange={this.handleChange.bind(this)}
                     label={i18next.t('client.participate.emergencynumber.label')}
                     placeholder={i18next.t('client.participate.emergencynumber.placeholder')}/>


          <Checkbox id="acceptsTos"
                    onChange={this.handleChange.bind(this)}>
            <span dangerouslySetInnerHTML={{__html: i18next.t('client.participate.accept_tos')}}/>
          </Checkbox>

          <Checkbox id="acceptsCodeOfHonour"
                    onChange={this.handleChange.bind(this)}>
            <span
              dangerouslySetInnerHTML={{__html: i18next.t('client.participate.accept_code_of_honour')}}/>
          </Checkbox>

          <Checkbox id="is18"
                    checked={this.state.is18 || false}
                    onChange={this.handleChange.bind(this)}>
            {i18next.t('client.participate.is_18')}
          </Checkbox>


          { this.state.errorMessage &&
          <div className="alert alert-warning" style={{textAlign: 'left'}}>
            {this.state.errorMessage}
          </div>
          }

          <CenterButton style='primary' onClick={this.register.bind(this)}>
            {i18next.t('client.participate.next_step')}
          </CenterButton>

        </Modal.Body>
      </Modal>
    );
  }
}