import React from 'react';

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
  className: React.PropTypes.string.isRequired,
  id: React.PropTypes.string,
  type: React.PropTypes.string,
  isLoading: React.PropTypes.bool,
  indicatorColor: React.PropTypes.string,
  children: React.PropTypes.any
};

export default Button;