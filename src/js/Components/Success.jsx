import React from 'react';

const Success = (props) => {
  return (
    <div className="success-message">
      <div className="logobox">
        <img src="/img/logo.svg"
             className="img-responsive"/>
      </div>
      <h3>
        {props.title}
      </h3>
      <p>{props.description}</p>
      <div>
        {props.children}
      </div>
    </div>
  );
};

Success.propTypes = {
  title: React.PropTypes.string.isRequired,
  description: React.PropTypes.string.isRequired,
  children: React.PropTypes.any
};

const VisitorSuccess = (props) => {
  return (
    <Success title={props.i18next.t('SPECTATOR-SUCCESS.HEADLINE')}
             description={props.i18next.t('SPECTATOR-SUCCESS.DESCRIPTION')}>

      Support: <a href="mailto:event@break-out.org">event@break-out.org</a>
      <br />
    </Success>);
};

VisitorSuccess.propTypes = {
  i18next: React.PropTypes.object.isRequired
};

class JoinTeamSuccess extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    const me = await this.props.api.getMe();
    console.log(me);
    const invoice = await this.props.api.getInvoiceForTeam(me.participant.teamId);
    console.log(invoice);
    this.setState({
      invoice: invoice
    });
  }

  invoiceText() {
    if (this.state.invoice) {
      return <div id="invoice-text">
        <div className="label label-default">IBAN</div>
        <div className="content"> 12345678910</div>
        <div className="label label-default">BIC</div>
        <div className="content"> 12345678910</div>
        <div className="label label-default">Zahlungsempfänger</div>
        <div className="content">Daria Brauner</div>
        <div className="label label-default">Überweisungszweck</div>
        <div className="content">{this.state.invoice.purposeOfTransfer}</div>
      </div>;
    } else {
      return 'Euer Überweisungszweck wird geladen...';
    }
  }

  render() {
    return (
      <Success title={this.props.i18next.t('client.join_team_success.title')}
               description={this.props.i18next.t('client.join_team_success.description')}>

        {this.invoiceText()}
        <div id="success-btn-container">
          <a href="/">
            <div className="btn btn-primary">
              {this.props.i18next.t('SPECTATOR-SUCCESS.LINK_DESCRIPTION')}
            </div>
          </a>
        </div>
        <div id="success-btn-container"><a href="/">Hier entlang, um Sponsoren einzutragen</a></div>
      </Success>
    );
  }
}

JoinTeamSuccess.propTypes = {
  i18next: React.PropTypes.object.isRequired
};

const CreateTeamSuccess = (props) => {
  return (
    <Success title={props.i18next.t('client.create_team_success.title')}
             description={props.i18next.t('client.create_team_success.description')}>
      <div id="success-btn-container">
        <a href="/">
          <div className="btn btn-primary">
            {props.i18next.t('client.create_team_success.button_text')}
          </div>
        </a>
      </div>
    </Success>
  );
};


CreateTeamSuccess.propTypes = {
  i18next: React.PropTypes.object.isRequired
};

export {Success, VisitorSuccess, JoinTeamSuccess, CreateTeamSuccess};