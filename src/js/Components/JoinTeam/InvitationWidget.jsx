import React from 'react';

const InviteOption = (props) => {
  return (
    <label key={props.label.team.id} className="radio-inline ">
      <span>
      <input type="radio" name={props.label.team.id} required=""
             value={parseInt(props.label.team.id)}/>
      <div>
        <div>{props.label.team.name}</div>
        <div>{props.label.team.members[0].firstname || ''} {props.label.team.members[0].lastname || ''}</div>
      </div>
      </span>
    </label>
  );
};

const InvitationWidget = (props) => {
  return (
    <div className="form-group field field-string invitation-widget"
         onChange={e => props.onChange(e.target.value)}>

      <label className="control-label" htmlFor={props.id}>
        {props.options.label}
      </label>

      <div></div>
      <div className="field-radio-group">
        {props.options.enumOptions.map(option => InviteOption(option))}
      </div>
      <div></div>
      <div></div>
    </div>
  );
};

export default InvitationWidget;