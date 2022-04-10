import React, { useEffect } from 'react';
import CookieConsent, {
  getCookieConsentValue,
  Cookies,
} from 'react-cookie-consent';
import ReactGA from 'react-ga';

function handleAcceptCookie() {
  ReactGA.initialize('UA-59857227-3');
}

export default function UserTracking() {
  const handleDeclineCookie = () => {
    //remove google analytics cookies
    Cookies.remove('_ga');
    Cookies.remove('_gat');
    Cookies.remove('_gid');
  };

  useEffect(() => {
    const isConsent = getCookieConsentValue();
    if (isConsent === 'true') {
      handleAcceptCookie();
    }
  }, []);

  return (
    <CookieConsent
      enableDeclineButton
      onAccept={handleAcceptCookie}
      onDecline={handleDeclineCookie}
      buttonText='Ja, kein Problem'
      declineButtonText='Ablehnen'
      buttonStyle={{
        background: '#e6823c'
      }}
      declineButtonStyle={{
        background: '#444'
      }}
    >
      Wir verwenden Cookies, um die Benutzer-Erfahrung zu verbessern.
    </CookieConsent>
  );
}
