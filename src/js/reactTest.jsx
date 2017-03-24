import React from 'react';
import ReactDOM from 'react-dom';

import BreakoutApi from './BreakoutApi';

import Login from './Components/Login/Login.jsx';
import Registration from './Components/Register/Registration.jsx';
import Participation from './Components/Participate/Participation.jsx';
import TeamCreation from './Components/TeamCreation/TeamCreation.jsx';
import JoinTeam from './Components/JoinTeam/JoinTeam.jsx';

import de from '../../resources/translations/translations.de';
import en from '../../resources/translations/translations.de';
import i18next from 'i18next';

import {getAccessToken} from './Components/helpers';

const FormContainer = (props) => {
  return (<div style={{
    margin: '30px',
    padding: '10px',
    border: '2px solid #e6823c',
    borderRadius: '2px'
  }}>{props.children}</div>);
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      api: this.props.api
    };
  }

  componentWillMount() {

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

    this.setState({i18next: i18next});

  }

  render() {
    return (
      <span>
        <FormContainer><Login api={this.state.api} i18next={this.state.i18next}/></FormContainer>

        <FormContainer><Registration api={this.state.api}
                                     i18next={this.state.i18next}/></FormContainer>

        <FormContainer><Participation
          api={this.state.api}
          i18next={this.state.i18next}/></FormContainer>

        <FormContainer><TeamCreation api={this.state.api}
                                     i18next={this.state.i18next}/></FormContainer>

        <FormContainer><JoinTeam api={this.state.api}
                                 i18next={this.state.i18next}/></FormContainer>
      </span>
    );
  }
}

BreakoutApi.initFromServer()
  .then(api => {
    api.setAccessToken(getAccessToken());
    ReactDOM.render(
      <App api={api}/>,
      document.getElementById('react-root')
    );

  }).catch(console.error);
