import JSForm from 'react-jsonschema-form';
import React from 'react';
import PropTypes from 'prop-types';

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
  children: PropTypes.array
};

export default Form;