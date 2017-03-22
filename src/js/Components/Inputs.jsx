import React from 'react';

import {
  FormGroup,
  ControlLabel,
  FormControl
} from 'react-bootstrap';

const TextInput = (props) => {
  return (
    <FormGroup controlId={props.id} validationState={props.isValid}>
      <ControlLabel>
        {props.label}
      </ControlLabel>
      <FormControl type={'text'}
                   value={props.value}
                   placeholder={props.placeholder}
                   onChange={props.onChange}>
      </FormControl>
    </FormGroup>
  );
};

const PasswordInput = (props) => {
  return (
    <FormGroup controlId={props.id} validationState={props.isValid}>
      <ControlLabel>
        {props.label}
      </ControlLabel>
      <FormControl type={'password'}
                   value={props.value}
                   placeholder={props.placeholder}
                   onChange={props.onChange}>
      </FormControl>
    </FormGroup>
  );
};

export {
  TextInput,
  PasswordInput
};