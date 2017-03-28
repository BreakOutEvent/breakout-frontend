import JSForm from 'react-jsonschema-form';
import React from 'react';

const Form = (props) => {
  const style = {width: '100%', display: 'flex', justifyContent: 'center'};

  return (
    <JSForm {...props}>
      <div className="form-children">
        {props.children.map((child, index) => <span style={style}
                                                    key={index}>{child}</span>)}
      </div>
    </JSForm>
  );
};

Form.propTypes = {
  children: React.PropTypes.array
};

export default Form;