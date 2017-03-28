import React from 'react';
import TeamCreation from './TeamCreation/TeamCreation.jsx';
import JoinTeam from './JoinTeam/JoinTeam.jsx';

const CreateOrJoinTeam = (props) => {
  return (
    <span>
      <TeamCreation {...props}>{props.children}</TeamCreation>
      <hr style={{
        height: '3px',
        borderColor: 'gray',
        borderWidth: '2px',
        marginTop: '40px',
        marginBottom: '20px'
      }}/>
      <JoinTeam {...props}>{props.children}</JoinTeam>
    </span>
  );
};

CreateOrJoinTeam.propTypes = {
  children: React.PropTypes.any
};

export default CreateOrJoinTeam;