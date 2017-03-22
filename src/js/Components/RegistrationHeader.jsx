import React from 'react';
import {
  Modal
} from 'react-bootstrap';

const Header = (props) => {

  const modalStyle = {
    paddingTop: '10px',
    paddingBottom: '0px'
  };

  const h1Style = {
    textAlign: 'center',
    fontSize: 'xx-large'
  };

  return (
    <Modal.Header style={modalStyle} closeButton>
      <h1 style={h1Style}>
        {props.title}
      </h1>
      <p>{props.description || ''}</p>
    </Modal.Header>
  );
};

export default Header;