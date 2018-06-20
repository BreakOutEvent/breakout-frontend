import React from 'react';
import PropTypes from 'prop-types';

const Button = (props) => {
  if (props.isLoading || false) {
    return (
      <button className={props.className} id={props.id} type={props.type}>
        <div className="spinner">
          <div className="bounce1" style={{backgroundColor: props.indicatorColor || 'white'}}></div>
          <div className="bounce2" style={{backgroundColor: props.indicatorColor || 'white'}}></div>
          <div className="bounce3" style={{backgroundColor: props.indicatorColor || 'white'}}></div>
        </div>
      </button >);
  } else {
    return <button className={props.className} id={props.id} type={props.type} onClick={props.onClick}>
      {props.children}
    </button>;
  }
};

Button.propTypes = {
  className: PropTypes.string.isRequired,
  id: PropTypes.string,
  type: PropTypes.string,
  isLoading: PropTypes.bool,
  indicatorColor: PropTypes.string,
  children: PropTypes.any
};

export default Button;