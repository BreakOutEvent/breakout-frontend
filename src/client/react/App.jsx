import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
  Redirect
} from 'react-router-dom';
import PropTypes from 'prop-types';
import i18next from 'i18next';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { createMuiTheme } from '@material-ui/core/styles';
import orange from '@material-ui/core/colors/orange';

import BreakoutApi from 'breakout-api-client';

import Login from './Components/Login/Login.jsx';
import Registration from './Components/Register/Registration.jsx';
import Participation from './Components/Participate/Participation.jsx';
import SelectRole from './Components/SelectRole/SelectRole.jsx';
import ResetPassword from './Components/ResetPassword/ResetPassword.jsx';
import CreateOrJoinTeam from './Components/CreateOrJoinTeam.jsx';
import SponsorInformation from './Components/Sponsor/SponsorInformation.jsx';
import {VisitorSuccess, JoinTeamSuccess, CreateTeamSuccess, TeamDeletionSuccess} from './Components/Success.jsx';
import de from '../../common/resources/translations/translations.de';
import en from '../../common/resources/translations/translations.en';
import Modal from './Components/Modal.jsx';

import ReactGA from 'react-ga';

import routes from './Components/routes';

import AdminInvoicePanel from './Components/Admin/AdminInvoicePanel.jsx';
import AdminUserOverview from './Components/Admin/AdminUserOverview.jsx';
import AddChallenge from './Components/TeamProfile/AddChallenge.jsx';
import ListOfChallenges from './Components/TeamProfile/ListOfChallenges.jsx';
import ListOfSponsors from './Components/TeamProfile/ListOfSponsors.jsx';
import ListOfSettings from './Components/TeamProfile/ListOfSettings.jsx';
import AdminEventsOverview from './Components/Admin/AdminEventsOverview.jsx';
import CookieConsentBanner from './Components/CookieConsentBanner.jsx';

const breakoutTheme = () => createMuiTheme({
  palette: {
    primary: orange,
  },
  typography: {
    useNextVariants: true
  }
});

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

const SponsorRegistration = (props) => (<SponsorInformation
  {...props} onSuccess={()=>window.location.href=routes.sponsorings}
/>);

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



    const url = window.boClientConfig.baseUrl;
    const clientId = window.boClientConfig.clientId;
    const clientSecret = window.boClientConfig.clientSecret;
    const cloudinaryConfig = window.boCloudinaryConfig;
    const api = new BreakoutApi(url, clientId, clientSecret, cloudinaryConfig.cloud_name, cloudinaryConfig.api_key);

    const isLoggedIn = window.boUserData;

    if (isLoggedIn) {
      api.setAccessToken(window.boUserData.access_token);
    }

    this.requestOpenRegistration(api);

    this.setState({i18next: i18next, api: api});
  }

  async requestOpenRegistration(api) {
    const events = await api.getAllEvents();
    const openEvents = await api.getAllOpenEvents();

    this.setState({
      isRequestingOpenRegistration: false,
      isRegistrationOpen: openEvents.length > 0,
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
        <MuiThemeProvider theme={breakoutTheme()}>
          <Comp {...props} api={this.state.api} i18next={this.state.i18next}
              isLoggedIn={!!window.boUserData}/>
        </MuiThemeProvider>
      </Modal>
    );
  }

  showComponent(Comp) {
    return (props) => (
      <div>
        <OnShowHack />
        <MuiThemeProvider theme={breakoutTheme()}>
          <Comp {...props} api={this.state.api} i18next={this.state.i18next}
                isLoggedIn={!!window.boUserData}/>
        </MuiThemeProvider>
      </div>
    );
  }

  render() {

    const RedirectRegistrationLock = (props) => {
      const render = () => {
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

    const LockedPageComponent = this.state.isRequestingOpenRegistration
      ? PrivateRoute
      : RedirectRegistrationLock;
      
    return <Router>
      <div>

        <Route exact path={routes.login}
                component={this.showModalFor(Login, 's')}/>

        <Route exact path={routes.register}
                component={this.showModalFor(Registration, 's')}/>

        <Route exact path={routes.resetPassword}
                component={this.showModalFor(ResetPassword, 's')}/>

        <PrivateRoute exact path={routes.selectRole}
                      component={this.showModalFor(SelectRole, 'm')}/>

        <LockedPageComponent exact path={routes.participate}
                      component={this.showModalFor(Participation, 'm')}/>

        <RedirectSponsor exact path={routes.sponsorRegistration}
                        component={this.showModalFor(SponsorRegistration, 'm')}/>

        <PrivateRoute exact path={routes.teamDeletionSuccess}
                      component={this.showModalFor(TeamDeletionSuccess, 's')}/>

        <LockedPageComponent exact path={routes.createOrJoinTeam}
                      component={this.showModalFor(CreateOrJoinTeam, 'm')}/>

        <PrivateRoute exact path={routes.visitorSuccess}
                      component={this.showModalFor(VisitorSuccess, 's')}/>

        <LockedPageComponent exact path={routes.joinTeamSuccess}
                      component={this.showModalFor(JoinTeamSuccess, 'm')}/>

        <LockedPageComponent exact path={routes.createTeamSuccess}
                      component={this.showModalFor(CreateTeamSuccess, 's')}/>

        <PrivateRoute exact path={routes.profileSettings}
                      component={this.showComponent(SponsorInformation)}/>

        <CookieConsentBanner />
      </div>
    </Router>;
  }
}

App.propTypes = {
  api: PropTypes.object
};

const url = window.boClientConfig.baseUrl;
const clientId = window.boClientConfig.clientId;
const clientSecret = window.boClientConfig.clientSecret;
const cloudinaryConfig = window.boCloudinaryConfig;
const api = new BreakoutApi(url, clientId, clientSecret, cloudinaryConfig.cloud_name, cloudinaryConfig.api_key);

const isLoggedIn = window.boUserData;

if (isLoggedIn) {
  api.setAccessToken(window.boUserData.access_token);
}

function renderIfExists(elem, domId) {
  const domNode = document.getElementById(domId);
  if (domNode) {
    ReactDOM.render(elem, domNode);
  } else {
    console.debug(`Not rendering react component because node with id ${domId} does not exist`);
  }
}

class StatefulListOfChallenges extends React.Component {
  constructor(props) {
    super(props);
    this.teamId = window.teamId;
    this.state = {challenges: [], error: null};
    this.update = this.update.bind(this);
  }

  componentWillMount() {
    this.setState({i18next: i18next});
  }

  componentDidMount() {
    this.props.api.fetchChallengesForTeam(this.teamId)
      .then(challenges => this.setState({
        challenges: challenges.sort((a,b)=>b.id-a.id)}
      ))
      .catch(error => this.setState({error}));
  }

  update(sponsorId) {
    this.props.api.fetchChallengesForTeam(this.teamId)
      .then(challenges => {
        let sortedByNewest = challenges.sort((a,b)=>b.id-a.id);
        let sortedByNewestAndUser = sortedByNewest.filter(challenge=>challenge.sponsor.sponsorId===sponsorId);
        let allChallengesFromOthers = sortedByNewest.filter(challenge=>challenge.sponsor.sponsorId!==sponsorId);
        sortedByNewestAndUser.push(...allChallengesFromOthers);
        this.setState({
          challenges: sortedByNewestAndUser
        });
      })
      .catch(error => this.setState({error}));
  }


  render() {
    if (this.state.error) {
      return <div className="alert alert-warning">Something went wrong when loading challenges</div>;
    }
    return <div>
      <AddChallenge isLoggedIn={!!window.boUserData} api={api} teamId={this.teamId} update={this.update}
                    i18next={i18next}/>
      <ListOfChallenges challenges={this.state.challenges}/>
    </div>;
  }
}

StatefulListOfChallenges.propTypes = {
  api: PropTypes.object.isRequired,
};

renderIfExists(<MuiThemeProvider theme={breakoutTheme()}><AdminInvoicePanel api={api}/></MuiThemeProvider>, 'react-admin-invoice');
renderIfExists(<MuiThemeProvider theme={breakoutTheme()}><AdminUserOverview api={api}/></MuiThemeProvider>, 'react-admin-users');
renderIfExists(<MuiThemeProvider theme={breakoutTheme()}><AdminEventsOverview api={api}/></MuiThemeProvider>, 'react-admin-events-overview');
renderIfExists(<App/>, 'react-root');
renderIfExists(
<MuiThemeProvider theme={breakoutTheme()}>
  <StatefulListOfChallenges api={api}/>
  </MuiThemeProvider>, 'react-challenge-list-root');
renderIfExists(<MuiThemeProvider theme={breakoutTheme()}>
  <ListOfSponsors api={api} teamId={window.teamId && window.teamId}
  i18next={i18next}  /></MuiThemeProvider>, 'react-sponsoring-list-root');
renderIfExists(<MuiThemeProvider theme={breakoutTheme()}>
  <ListOfSettings api={api} teamId={window.teamId && window.teamId}  i18next={i18next}/>
  </MuiThemeProvider>, 'react-settings-list-root');
