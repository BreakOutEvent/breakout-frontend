import React from 'react';
import TeamCreation from './TeamCreation/TeamCreation.jsx';
import JoinTeam from './JoinTeam/JoinTeam.jsx';

const SelectionSwitcher = (props) => {
  return (
    <div className="btn-group" style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
      {props.options.map(option => <Selection key={option.key}
                                              option={option}
                                              onClick={props.onClick}/>)}
    </div>
  );
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

class CreateOrJoinTeam extends React.Component {
  constructor(props) {
    super(props);
    // TODO: Set selectedOption based on whether user has invite or not
    this.state = {
      selectedOption: 'createTeam'
    };
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
      return <JoinTeam {...this.props}>{this.props.children}</JoinTeam>;
    }
  }

  render() {

    const options = [{
      text: 'Ein Team erstellen',
      key: 'createTeam',
      isActive: this.state.selectedOption === 'createTeam'
    }, {
      text: 'Einem Team beitreten',
      key: 'joinTeam',
      isActive: this.state.selectedOption === 'joinTeam'
    }];


    return (
      <span>
        <h3 style={{textAlign: 'center'}}>Team erstellen oder beitreten</h3>
        <SelectionSwitcher options={options} onClick={this.onClick.bind(this)}/>
        <div style={{marginBottom: '20px'}}></div>
        {this.renderSelectedOption()}
      </span>
    );
  }
}

CreateOrJoinTeam.propTypes = {
  children: React.PropTypes.any
};

export default CreateOrJoinTeam;