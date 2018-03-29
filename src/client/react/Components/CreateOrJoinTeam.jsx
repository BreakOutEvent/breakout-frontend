import React from 'react';
import TeamCreation from './TeamCreation/TeamCreation.jsx';
import JoinTeam from './JoinTeam/JoinTeam.jsx';
import Breadcrumbs from './Breadcrumb.jsx';
import routes from './routes';

const SelectionSwitcher = (props) => {
  return (
    <div className="btn-group selection-switcher">
      {props.options.map(option => <Selection key={option.key}
                                              option={option}
                                              onClick={props.onClick}/>)}
    </div>
  );
};

SelectionSwitcher.propTypes = {
  options: React.PropTypes.array.isRequired,
  onClick: React.PropTypes.func.isRequired
};

const Selection = (props) => {
  if (props.option.isActive) {
    return (
      <label className="btn btn-primary active" id={props.option.key} onClick={props.onClick}>
        {props.option.text}
      </label>
    );
  } else {
    return (
      <label className="btn btn-primary" id={props.option.key} onClick={props.onClick}>
        {props.option.text}
      </label>
    );
  }
};

Selection.propTypes = {
  option: React.PropTypes.object.isRequired,
  onClick: React.PropTypes.func.isRequired
};

class CreateOrJoinTeam extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedOption: undefined,
      isLoadingInvitations: true
    };
  }

  async componentDidMount() {
    try {
      let invitations = await this.props.api.getAllInvitations();
      // filter for invitations to teams which still have team members (in case of leaving after invitation)
      invitations = invitations.filter(invitation => invitation.team.members.length >= 1);
      this.setState({
        invitations: invitations,
        selectedOption: (invitations.length ? 'joinTeam' : 'createTeam'),
        isLoadingInvitations: false
      });
    } catch (err) {
      throw err;
    }
  }

  onClick(e) {
    this.setState({
      selectedOption: e.currentTarget.id
    });
  }

  renderSelectedOption() {
    if (this.state.selectedOption === 'createTeam') {
      return <TeamCreation {...this.props}>{this.props.children}</TeamCreation>;
    } else {
      return <JoinTeam {...this.props} invitations={this.state.invitations}>{this.props.children}</JoinTeam>;
    }
  }

  render() {

    const options = [{
      text: this.props.i18next.t('client.create_team.title'),
      key: 'createTeam',
      isActive: this.state.selectedOption === 'createTeam'
    }, {
      text: this.props.i18next.t('client.join_team.title'),
      key: 'joinTeam',
      isActive: this.state.selectedOption === 'joinTeam'
    }];

    const entries = [{
      title: this.props.i18next.t('client.breadcrumbs.role_select'),
      isActive: false,
      link: routes.selectRole
    }, {
      title: this.props.i18next.t('client.breadcrumbs.participate'),
      isActive: false,
      link: routes.participate
    }, {
      title: this.props.i18next.t('client.breadcrumbs.create_join_team'),
      isActive: true,
      link: '#'
    }];

    return (this.state.isLoadingInvitations
      ? <div className="alert alert-info">{this.props.i18next.t('client.join_team.loading')}</div>
      : <span className="create-or-join-team">
          <Breadcrumbs entries={entries}/>
          <h3>Team erstellen oder beitreten</h3>
          <SelectionSwitcher options={options} onClick={this.onClick.bind(this)}/>
          <div style={{marginBottom: '20px'}} />
          {this.renderSelectedOption()}
        </span>
      );
  }
}

CreateOrJoinTeam.propTypes = {
  children: React.PropTypes.any,
  i18next: React.PropTypes.object.isRequired
};

export default CreateOrJoinTeam;