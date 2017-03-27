import React from 'react';

const Button = (props) => {
  if (props.isLoading || false) {
    return (
      <button {...props} className="btn btn-primary">
        <div className="spinner">
          <div className="bounce1"></div>
          <div className="bounce2"></div>
          <div className="bounce3"></div>
        </div>
      </button >);
  } else {
    return <button {...props}>{props.children}</button>;
  }
};

export default Button;