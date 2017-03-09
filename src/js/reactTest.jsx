import React from 'react';
import ReactDOM from 'react-dom';
import Registration from './Components/Registration.jsx';

const App = () => {
  return <Registration visible={true}/>;
};

ReactDOM.render(
  <App/>,
  document.getElementById('react-root')
);