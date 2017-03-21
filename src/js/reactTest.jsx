import React from 'react';
import ReactDOM from 'react-dom';
import Login from './Components/Login.jsx';
import $ from 'jquery';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }

  componentWillMount() {
    $('#bo-login-btn').click(() => this.setState({visible: true}));
  }

  render() {
    return <Login visible={this.state.visible} onHide={() => this.setState({visible: false})}/>;
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById('react-root')
);