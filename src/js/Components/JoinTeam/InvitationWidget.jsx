import React from 'react';

const InviteOption = (props) => {
  return (
    <div className="invite-option field-radio-group">
      <label key={props.label.team.id} className="radio-inline ">
      <span>
      <input type="radio"
             name={props.label.team.id}
             value={parseInt(props.label.team.id)}
             onClick={props.onClick}
             checked={props.selected}/>
      <div className="radio-team">
        <div className="radio-team-name">{props.label.team.name}</div>
        <div
          className="radio-team-description">{props.label.team.members[0].firstname || ''} {props.label.team.members[0].lastname || ''}</div>
      </div>
      </span>
      </label>
    </div>
  );
};

InviteOption.propTypes = {
  label: React.PropTypes.object.isRequired
};

class InvitationWidget extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  onClick(e) {
    const selectedTeam = e.currentTarget.value;
    this.setState({
      selectedTeam: selectedTeam
    });
  }

  render() {
    return (
      <div className="form-group field field-string invitation-widget"
           onChange={e => this.props.onChange(e.target.value)}>

        <div></div>
        <div>
          {this.props.options.enumOptions.map(option =>
            <InviteOption {...option}
                          key={option.label.team.id}
                          onClick={this.onClick.bind(this)}
                          selected={(option.label.team.id == this.state.selectedTeam)}/>)}
        </div>
        <div></div>
        <div></div>
      </div>
    );
  }
}

InvitationWidget.propTypes = {
  onChange: React.PropTypes.func.isRequired,
  options: React.PropTypes.object.isRequired
};

export default InvitationWidget;