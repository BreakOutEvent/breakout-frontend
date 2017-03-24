import JSForm from 'react-jsonschema-form';
import React from 'react';

const Form = (props) => {
  return (
    <JSForm {...props}>
      <div className="form-children">{props.children}</div>
    </JSForm>
  );
};

export default Form;