import React, { useEffect } from 'react';
import CookieConsent, {
  getCookieConsentValue,
  Cookies,
} from 'react-cookie-consent';
import ReactGA from 'react-ga';
import PropTypes from 'prop-types';

function handleAcceptCookie() {
  ReactGA.initialize('UA-59857227-3');
  if(window.gtag) {
    window.gtag('consent', 'update', {
      'ad_storage': 'granted',
      'analytics_storage': 'granted'
    });
  }
}

function CookieConsentBanner({ i18next }) {
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
      buttonText={i18next.t('client.cookie_consent.accept')}
      declineButtonText={i18next.t('client.cookie_consent.decline')}
      style={{zIndex: 2000}}
      buttonStyle={{
        background: '#e6823c'
      }}
      declineButtonStyle={{
        background: '#444'
      }}
    >
      {i18next.t('client.cookie_consent.description')}
    </CookieConsent>
  );
}

CookieConsentBanner.propTypes = {
  i18next: PropTypes.object.isRequired
};

export default CookieConsentBanner;