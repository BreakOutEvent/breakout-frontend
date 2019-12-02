import React from 'react';
import PropTypes from 'prop-types';

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
      <div>{props.description}</div>
      <div>
        {props.children}
      </div>
    </div>
  );
};

Success.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.any.isRequired,
  children: PropTypes.any
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
  i18next: PropTypes.object.isRequired
};

class JoinTeamSuccess extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    const me = await this.props.api.getMe();
    const invoice = await this.props.api.getInvoiceForTeam(me.participant.teamId);
    this.setState({
      invoice: invoice
    });
  }

  invoiceText() {
    if (this.state.invoice) {
      // TODO: This should not be hardcoded
      return <div id="invoice-text">
        <div
          className="label label-default">{this.props.i18next.t('client.join_team_success.IBAN')}</div>
        <div className="content">{this.state.invoice.event.iban}</div>
        <div
          className="label label-default">{this.props.i18next.t('client.join_team_success.BIC')}</div>
        <div className="content">{this.state.invoice.event.bic}</div>
        <div
          className="label label-default">{this.props.i18next.t('client.join_team_success.payment_reciever')}</div>
        <div className="content">BreakOut e.V.</div>
        <div
          className="label label-default">{this.props.i18next.t('client.join_team_success.purpose_of_transaction')}</div>
        <div className="content">{this.state.invoice.purposeOfTransfer}</div>
      </div>;
    } else {
      return this.props.i18next.t('client.join_team_success.loading_purpose_of_transfer');
    }
  }

  render() {

    const description = <div>
      {this.props.i18next.t('PAYMENT.DESCRIPTION_1')}
      <ul style={{marginTop: '10px'}}>
        <li>{this.props.i18next.t('PAYMENT.ELEMENT_1')}</li>
        <li>{this.props.i18next.t('PAYMENT.ELEMENT_2')}</li>
        <li>{this.props.i18next.t('PAYMENT.ELEMENT_3')}</li>
      </ul>
      <span dangerouslySetInnerHTML={{__html: this.props.i18next.t('PAYMENT.DESCRIPTION_2')}}/> <br/><br/>
      <span dangerouslySetInnerHTML={{__html: this.props.i18next.t('PAYMENT.DESCRIPTION_3')}}/> <br/><br/>
      <span dangerouslySetInnerHTML={{__html: this.props.i18next.t('PAYMENT.DESCRIPTION_4')}}/> <br/><br/>
    </div>;

    return (
      <Success title={this.props.i18next.t('client.join_team_success.title')}
               description={description}>

        {this.invoiceText()}
        <div id="success-btn-container">
          <a href="/settings/sponsoring">
            <div className="btn btn-primary">
              {this.props.i18next.t('client.join_team_success.add_sponsorings_link_text')}
            </div>
          </a>
        </div>
        <div id="success-btn-container"><a
          href="/">{this.props.i18next.t('SPECTATOR-SUCCESS.LINK_DESCRIPTION')}</a></div>
      </Success>
    );
  }
}

JoinTeamSuccess.propTypes = {
  i18next: PropTypes.object.isRequired,
  api: PropTypes.object.isRequired
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
  i18next: PropTypes.object.isRequired
};

export {Success, VisitorSuccess, JoinTeamSuccess, CreateTeamSuccess};