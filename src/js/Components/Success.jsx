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
      return `Überweisungszweck: ${this.state.invoice.purposeOfTransfer}`;
    } else {
      return 'Euer Überweisungszweck wird geladen...';
    }
  }

  render() {
    return (
      <Success title={this.props.i18next.t('client.join_team_success.title')}
               description={this.props.i18next.t('client.join_team_success.description')}>

        <p>{this.invoiceText()}</p>
        <a href="/">
          <div className="btn btn-primary">
            {this.props.i18next.t('SPECTATOR-SUCCESS.LINK_DESCRIPTION')}
          </div>
        </a>
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
      <a href="/">
        <div className="btn btn-primary">
          {props.i18next.t('client.create_team_success.button_text')}
        </div>
      </a>
    </Success>
  );
};


CreateTeamSuccess.propTypes = {
  i18next: React.PropTypes.object.isRequired
};

export {Success, VisitorSuccess, JoinTeamSuccess, CreateTeamSuccess};