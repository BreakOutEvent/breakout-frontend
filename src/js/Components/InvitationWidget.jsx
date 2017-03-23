import React from 'react';

const InvitationWidget = (props) => {
  return (
    <div className="form-group field field-string invitation-widget"
         onChange={e => props.onChange(e.target.value)}>

      <label className="control-label" htmlFor={props.id}>
        {props.options.label}
      </label>

      <div></div>
      <div className="field-radio-group">

        {props.options.enumOptions.map(option => {
          {
            console.log(option.label.team.id);
          }
          return (
            <label key={option.label.team.id} className="radio-inline ">
                  <span>
                    <input type="radio" name={option.label.team.id}
                           required="" value={parseInt(option.label.team.id)}/>
                    <div>
                      <div>{option.label.team.name}</div>
                      <div>{props.invitedByStr}{option.label.team.members[0].firstname} {option.label.team.members[0].lastname}</div>
                    </div>
                  </span>
            </label>
          );
        })}

      </div>
      <div></div>
      <div></div>
    </div>
  );
};

export default InvitationWidget;