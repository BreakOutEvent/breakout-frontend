import React from 'react';
import Breadcrumbs from '../Breadcrumb.jsx';
import routes from '../routes';

export default class RoleSelector extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  onClick(e) {
    this.setState({
      selectedRole: e.currentTarget.id
    });
    this.next(e.currentTarget.id);
  }

  next(selectedRole) {
    if (selectedRole === 'visitor') {
      this.props.history.push(routes.visitorSuccess);
    } else if (selectedRole === 'participant') {
      this.props.history.push(routes.participate);
    } else if (selectedRole === 'sponsor') {
      this.props.history.push('/sponsor');
      window.location = '/sponsor';
    }
  }

  render() {
    const i18next = this.props.i18next;
    const entries = [{
      title: i18next.t('client.breadcrumbs.role_select'),
      isActive: true,
      link: '#'
    }];
    return (
      <form>
        <Breadcrumbs entries={entries}/>
        <legend>{i18next.t('client.role_select.headline')}</legend>
        <p className="field-description">{i18next.t('client.role_select.description')}</p>

        <Selector roleTitle={i18next.t('client.role_select.visitor_title')}
                  roleText={i18next.t('client.role_select.visitor_text')}
                  role="visitor"
                  onClick={this.onClick.bind(this)}/>

        <Selector roleTitle={i18next.t('client.role_select.participant_title')}
                  roleText={i18next.t('client.role_select.participant_text')}
                  role="participant"
                  onClick={this.onClick.bind(this)}/>

        <Selector roleTitle={i18next.t('client.role_select.sponsor_title')}
                  roleText={i18next.t('client.role_select.sponsor_text')}
                  role="sponsor"
                  onClick={this.onClick.bind(this)}/>


      </form>
    );
  }
}

RoleSelector.propTypes = {
  history: React.PropTypes.object.isRequired,
  i18next: React.PropTypes.object.isRequired
};

const Selector = (props) => {

  return (
    <div className="row roleSelector">
      <div className="col-sm-12">
        <button className="roleSelectOne btn btn-primary" id={props.role} onClick={props.onClick}>
          <h3>{props.roleTitle}</h3>
          <p>{props.roleText}</p>
        </button>
      </div>
    </div>
  );
};

Selector.propTypes = {
  roleTitle: React.PropTypes.string.isRequired,
  roleText: React.PropTypes.string.isRequired,
  onClick: React.PropTypes.func.isRequired,
  role: React.PropTypes.string.isRequired
};

