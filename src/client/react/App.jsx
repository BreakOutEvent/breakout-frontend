import React from 'react';
import ReactDOM from 'react-dom';

import BreakoutApi from 'breakout-api-client';

import Login from './Components/Login/Login.jsx';
import Registration from './Components/Register/Registration.jsx';
import Participation from './Components/Participate/Participation.jsx';
import SelectRole from './Components/SelectRole/SelectRole.jsx';
import ResetPassword from './Components/ResetPassword/ResetPassword.jsx';
import CreateOrJoinTeam from './Components/CreateOrJoinTeam.jsx';
import SponsorRegistration from './Components/Sponsor/Sponsor.jsx';
import SponsorSettings from './Components/Sponsor/Settings.jsx';
import {VisitorSuccess, JoinTeamSuccess, CreateTeamSuccess} from './Components/Success.jsx';
import de from '../../common/resources/translations/translations.de';
import en from '../../common/resources/translations/translations.en';
import i18next from 'i18next';
import Modal from './Components/Modal.jsx';
import {
  BrowserRouter as Router,
  Route,
  Redirect
} from 'react-router-dom';

import ReactGA from 'react-ga';
ReactGA.initialize('UA-59857227-3');

import routes from './Components/routes';
import AdminInvoicePanel from './Components/Admin/AdminInvoicePanel.jsx';
import {MuiThemeProvider} from 'material-ui';
import AddChallenge from './Components/TeamProfile/AddChallenge.jsx';
import ListOfChallenges from './Components/TeamProfile/ListOfChallenges.jsx';
import PropTypes from 'prop-types';


const OnShowHack = (props) => {
  if (props.overflowHidden) {
    document.body.className += ' ReactModal__Body--open';
  }
  try {
    ReactGA.set({page: window.location.pathname});
    ReactGA.pageview(window.location.pathname);
  } catch (err) {
    console.error('Error logging react view', err);
  }

  return null;
};

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      api: this.props.api,
      activeModal: null,
      isLoggedIn: !!window.boUserData,
      isRequestingOpenRegistration: true
    };
    this.requestOpenRegistration = this.requestOpenRegistration.bind(this);
  }

  componentWillMount() {

    i18next.init({
      lng: window.getBoUserLang(),
      fallbackLng: 'en',
      resources: {
        de: {
          translation: de
        },
        en: {
          translation: en
        }
      }
    });

    const url = window.boClientConfig.baseUrl;
    const clientId = window.boClientConfig.clientId;
    const clientSecret = window.boClientConfig.clientSecret;
    const cloudinaryConfig = window.boCloudinaryConfig;
    const api = new BreakoutApi(url, clientId, clientSecret, cloudinaryConfig.cloud_name, cloudinaryConfig.api_key);

    this.requestOpenRegistration(api);

    const isLoggedIn = window.boUserData;

    if (isLoggedIn) {
      api.setAccessToken(window.boUserData.access_token);
    }

    this.setState({i18next: i18next, api: api});
  }

  async requestOpenRegistration(api) {
    const events = await api.getAllEvents();

    this.setState({
      isRequestingOpenRegistration: false,
      isRegistrationOpen: events.find(event => event.openForRegistration),
      isSponsoringOpen: events.find(event => event.allowNewSponsoring)
    });
  }

  onHide() {
    document.body.className = '';
    location.replace('/');
  }

  showModalFor(Comp, size) {
    return (props) => (
      <Modal show={true}
             onHide={this.onHide.bind(this)}
             modalClassName={'modal-size-' + size + ' react-modal'}>
        <OnShowHack overflowHidden={true}></OnShowHack>
        <MuiThemeProvider>
          <Comp {...props} api={this.state.api} i18next={this.state.i18next}
              isLoggedIn={!!window.boUserData}/>
        </MuiThemeProvider>
      </Modal>
    );
  }

  showComponent(Comp) {
    return (props) => (
      <div>
        <OnShowHack ></OnShowHack>
        <MuiThemeProvider>
          <Comp {...props} api={this.state.api} i18next={this.state.i18next}
                isLoggedIn={!!window.boUserData}/>
        </MuiThemeProvider>
      </div>
    );
  }

  render() {

    const RedirectRegistrationLock = (props) => {
      const render = (componentProps) => {
        window.location.href = '/closed';
      };
      let propsCopy = Object.assign({}, props);
      delete propsCopy.component;
      return <Route {...propsCopy} render={render}/>;
    };

    const PrivateRoute = (props) => {

      const render = (componentProps) => {
        if (this.state.isLoggedIn) {
          return React.createElement(props.component, componentProps);
        } else {
          return <Redirect to={{pathname: routes.login, state: {from: props.location}}}/>;
        }
      };

      let propsCopy = Object.assign({}, props);
      delete propsCopy.component;
      return <Route {...propsCopy} render={render}/>;
    };

    const RedirectSponsor = (props) => {

      const render = (componentProps) => {
        if (!this.state.isSponsoringOpen) {
          window.location.href = '/sponsor-closed';
        } else {
          if (window.boUserData && !window.boUserData.status.is.sponsor) {
            return React.createElement(props.component, componentProps);
          } else {
            window.location.href = '/settings/sponsoring';
          }
        }
      };

      let propsCopy = Object.assign({}, props);
      delete propsCopy.component;
      return <Route {...propsCopy} render={render}/>;
    };

    if(this.state.isRequestingOpenRegistration) {
      return null;
    }

    if(!this.state.isRegistrationOpen) {
      return (<Router>
        <div>

          <Route exact path={routes.login}
                 component={this.showModalFor(Login, 's')}/>

          <Route exact path={routes.register}
                 component={this.showModalFor(Registration, 's')}/>

          <Route exact path={routes.resetPassword}
                 component={this.showModalFor(ResetPassword, 's')}/>

          <PrivateRoute exact path={routes.selectRole}
                        component={this.showModalFor(SelectRole, 'm')}/>

          <RedirectRegistrationLock exact path={routes.participate}
                        component={this.showModalFor(Participation, 'm')}/>

          <RedirectSponsor exact path={routes.sponsorRegistration}
                         component={this.showModalFor(SponsorRegistration, 'm')}/>

          <RedirectRegistrationLock exact path={routes.createOrJoinTeam}
                        component={this.showModalFor(CreateOrJoinTeam, 'm')}/>

          <PrivateRoute exact path={routes.visitorSuccess}
                        component={this.showModalFor(VisitorSuccess, 's')}/>

          <RedirectRegistrationLock exact path={routes.joinTeamSuccess}
                        component={this.showModalFor(JoinTeamSuccess, 'm')}/>

          <RedirectRegistrationLock exact path={routes.createTeamSuccess}
                        component={this.showModalFor(CreateTeamSuccess, 's')}/>

          <PrivateRoute exact path={routes.profileSettings}
                        component={this.showComponent(SponsorSettings)}/>

        </div>
      </Router>);
    } else {
      return (
        <Router>
          <div>
            <Route exact path={routes.login}
                   component={this.showModalFor(Login, 's')}/>

            <Route exact path={routes.register}
                   component={this.showModalFor(Registration, 's')}/>

            <Route exact path={routes.resetPassword}
                   component={this.showModalFor(ResetPassword, 's')}/>

            <PrivateRoute exact path={routes.selectRole}
                          component={this.showModalFor(SelectRole, 'm')}/>

            <PrivateRoute exact path={routes.participate}
                          component={this.showModalFor(Participation, 'm')}/>

            <PrivateRoute exact path={routes.createOrJoinTeam}
                          component={this.showModalFor(CreateOrJoinTeam, 'm')}/>

            <RedirectSponsor exact path={routes.sponsorRegistration}
                          component={this.showModalFor(SponsorRegistration, 'm')}/>

            <PrivateRoute exact path={routes.visitorSuccess}
                          component={this.showModalFor(VisitorSuccess, 's')}/>

            <PrivateRoute exact path={routes.joinTeamSuccess}
                          component={this.showModalFor(JoinTeamSuccess, 'm')}/>

            <PrivateRoute exact path={routes.createTeamSuccess}
                          component={this.showModalFor(CreateTeamSuccess, 's')}/>

            <PrivateRoute exact path={routes.profileSettings}
                          component={this.showComponent(SponsorSettings)}/>

          </div>
        </Router>
      );
    }
  }
}

App.propTypes = {
  api: PropTypes.object
};

const url = window.boClientConfig.baseUrl;
const clientId = window.boClientConfig.clientId;
const clientSecret = window.boClientConfig.clientSecret;
const api = new BreakoutApi(url, clientId, clientSecret);

const isLoggedIn = window.boUserData;

if (isLoggedIn) {
  api.setAccessToken(window.boUserData.access_token);
}

function renderIfExists(elem, domId) {
  const domNode = document.getElementById(domId);
  if (domNode) {
    ReactDOM.render(elem, domNode);
  } else {
    // console.warn(`Not rendering react component because node with id ${domId} does not exist`);
  }
}

class StatefulListOfChallenges extends React.Component {
  constructor(props) {
    super(props);
    this.teamId = window.teamId;
    this.state = {challenges: [], error: null};
  }

  componentDidMount() {
    this.props.api.fetchChallengesForTeam(this.teamId)
      .then(challenges => this.setState({challenges}))
      .catch(error => this.setState({error}));
  }

  render() {
    if (this.state.error) {
      return <div className="alert alert-warning">Something went wrong when loading challenges</div>;
    }
    return <div>
      <AddChallenge />
      <ListOfChallenges challenges={this.state.challenges}/>
    </div>;
  }
}

renderIfExists(<MuiThemeProvider><AdminInvoicePanel api={api}/></MuiThemeProvider>, 'react-admin-invoice');
renderIfExists(<App/>, 'react-root');
renderIfExists(<MuiThemeProvider><StatefulListOfChallenges api={api}/></MuiThemeProvider>, 'react-challenge-list-root');