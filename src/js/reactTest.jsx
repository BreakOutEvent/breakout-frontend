import React from 'react';
import ReactDOM from 'react-dom';
import LoginForm from './Components/LoginForm.jsx';
import RegistrationForm from './Components/RegistrationForm.jsx';
import TeamCreationForm from './Components/TeamCreationForm.jsx';
import ParticipationForm from './Components/ParticipationForm.jsx';
import JoinTeamForm from './Components/JoinTeamForm.jsx';
import de from '../../resources/translations/translations.de';
import en from '../../resources/translations/translations.de';
import i18next from 'i18next';

const FormContainer = (props) => {
  return (<div style={{
    margin: '30px',
    padding: '10px',
    border: '2px solid #e6823c',
    borderRadius: '2px'
  }}>{props.children}</div>);
};

const testEvents = [
  {
    'id': 1,
    'title': 'BreakOut Berlin',
    'date': 1464937200,
    'city': 'Berlin',
    'startingLocation': {
      'latitude': 52.512643,
      'longitude': 13.321876
    },
    'duration': 36
  },
  {
    'id': 2,
    'title': 'BreakOut München',
    'date': 1464937200,
    'city': 'München',
    'startingLocation': {
      'latitude': 48.150676,
      'longitude': 11.580984
    },
    'duration': 36
  },
  {
    'id': 3,
    'title': 'Breakout München 2017',
    'date': 1488464649,
    'city': 'München',
    'startingLocation': {
      'latitude': 0.0,
      'longitude': 0.0
    },
    'duration': 36
  },
  {
    'id': 4,
    'title': 'Mein ganz eigenes Testevent',
    'date': 1489591050,
    'city': 'München',
    'startingLocation': {
      'latitude': 0.0,
      'longitude': 0.0
    },
    'duration': 36
  }
];

const invitations = [{
  'team': 184,
  'name': 'Mein Testteam'
}];

const getTeamById = (teamId) => {
  return {
    'id': 184,
    'name': 'Mein Testteam',
    'event': 4,
    'description': 'Our team is awesome',
    'hasStarted': true,
    'members': [
      {
        'firstname': 'Florian',
        'lastname': 'Schmidt',
        'gender': 'male',
        'id': 207,
        'participant': {
          'eventId': 4,
          'eventCity': 'München',
          'teamId': 184,
          'teamName': 'Mein Testteam',
          'tshirtSize': 'l'
        },
        'profilePic': {
          'id': 313,
          'type': 'IMAGE',
          'uploadToken': null,
          'sizes': [
            {
              'id': 21375,
              'url': 'https://breakoutmedia.blob.core.windows.net/recoded/e6e2fa82-e1fa-434e-a787-7304b24fd27d.jpg',
              'width': 200,
              'height': 200,
              'length': 0,
              'size': 4523,
              'type': 'IMAGE'
            },
            {
              'id': 21375,
              'url': 'https://breakoutmedia.blob.core.windows.net/recoded/e6e2fa82-e1fa-434e-a787-7304b24fd27d.jpg',
              'width': 200,
              'height': 200,
              'length': 0,
              'size': 4523,
              'type': 'IMAGE'
            },
            {
              'id': 21377,
              'url': 'https://breakoutmedia.blob.core.windows.net/recoded/7c332bb9-6e50-4a86-838e-0d1cbba27596.jpg',
              'width': 600,
              'height': 600,
              'length': 0,
              'size': 27233,
              'type': 'IMAGE'
            },
            {
              'id': 21377,
              'url': 'https://breakoutmedia.blob.core.windows.net/recoded/7c332bb9-6e50-4a86-838e-0d1cbba27596.jpg',
              'width': 600,
              'height': 600,
              'length': 0,
              'size': 27233,
              'type': 'IMAGE'
            },
            {
              'id': 21378,
              'url': 'https://breakoutmedia.blob.core.windows.net/recoded/c90298c2-6829-401d-8fc0-d1e8f5254c0e.jpg',
              'width': 120,
              'height': 120,
              'length': 0,
              'size': 2139,
              'type': 'IMAGE'
            },
            {
              'id': 21378,
              'url': 'https://breakoutmedia.blob.core.windows.net/recoded/c90298c2-6829-401d-8fc0-d1e8f5254c0e.jpg',
              'width': 120,
              'height': 120,
              'length': 0,
              'size': 2139,
              'type': 'IMAGE'
            },
            {
              'id': 21379,
              'url': 'https://breakoutmedia.blob.core.windows.net/recoded/959d895f-bd20-4968-bfc0-08bb9543d1b5.jpg',
              'width': 400,
              'height': 400,
              'length': 0,
              'size': 12652,
              'type': 'IMAGE'
            },
            {
              'id': 21379,
              'url': 'https://breakoutmedia.blob.core.windows.net/recoded/959d895f-bd20-4968-bfc0-08bb9543d1b5.jpg',
              'width': 400,
              'height': 400,
              'length': 0,
              'size': 12652,
              'type': 'IMAGE'
            },
            {
              'id': 21384,
              'url': 'https://breakoutmedia.blob.core.windows.net/recoded/9a9cf032-d10e-4a06-8de6-5f9226e90c8b.jpg',
              'width': 728,
              'height': 728,
              'length': 0,
              'size': 58513,
              'type': 'IMAGE'
            },
            {
              'id': 21384,
              'url': 'https://breakoutmedia.blob.core.windows.net/recoded/9a9cf032-d10e-4a06-8de6-5f9226e90c8b.jpg',
              'width': 728,
              'height': 728,
              'length': 0,
              'size': 58513,
              'type': 'IMAGE'
            }
          ]
        },
        'roles': [
          'SPONSOR',
          'PARTICIPANT'
        ],
        'blocked': false
      }
    ],
    'profilePic': {
      'id': 8384,
      'type': 'IMAGE',
      'uploadToken': null,
      'sizes': []
    },
    'invoiceId': 1463,
    'hasFullyPaid': false,
    'distance': 6275.318754778494,
    'donateSum': {
      'sponsorSum': 0,
      'withProofSum': 0,
      'acceptedProofSum': 0,
      'fullSum': 0
    },
    'full': false
  };
};

const refinedInvites = invitations.map(invitation => {
  const teamId = invitation.team;
  const team = getTeamById(teamId);
  invitation.team = team;
  return invitation;
});

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

ReactDOM.render(
  <span>
    <FormContainer><LoginForm i18next={i18next}/></FormContainer>
    <FormContainer><RegistrationForm i18next={i18next}/></FormContainer>
    <FormContainer><ParticipationForm i18next={i18next}/></FormContainer>
    <FormContainer><TeamCreationForm events={testEvents} i18next={i18next}/></FormContainer>
    <FormContainer><JoinTeamForm invitations={refinedInvites} i18next={i18next}/></FormContainer>
  </span>,
  document.getElementById('react-root')
);