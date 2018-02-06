import JSForm from 'react-jsonschema-form';
import React from 'react';

const Form = (props) => {

  return (
    <JSForm {...props}>
      <div className="form-children">
        {props.children.map((child, index) => <span className="form-child"
                                                    key={index}>{child}</span>)}
      </div>
    </JSForm>
  );
};

Form.propTypes = {
  children: React.PropTypes.array
};

export default Form;