import React from 'react';

class EmailConfirmationCheck extends React.Component {
  componentDidMount() {

  }

  render() {
    const style = {
      top: {
        backgroundColor: '#55AA55',
      }
    };

    return (this.props.isLoggedIn.me.blocked
      ? <div style={style.top}>Bitte bestätige deine Mail-Adresse</div>
      : <div></div>
    );
  }
}

export default EmailConfirmationCheck;