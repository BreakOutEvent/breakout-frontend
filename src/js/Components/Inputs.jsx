import React from 'react';

import {
  FormGroup,
  ControlLabel,
  FormControl
} from 'react-bootstrap';

const TextInput = (props) => {
  const validationState = props.isValid(props.id) ? null : 'error';
  return (
    <FormGroup controlId={props.id} validationState={validationState}>
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
  const validationState = props.isValid(props.id) ? null : 'error';
  return (
    <FormGroup controlId={props.id} validationState={validationState}>
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

const OptionsInput = (props) => {
  const validationState = props.isValid(props.id) ? null : 'error';
  return (
    <FormGroup controlId={props.id} validationState={validationState}>
      <ControlLabel>
        {props.label}
      </ControlLabel>
      <FormControl componentClass="select"
                   placeholder=""
                   onChange={props.onChange}>
        {props.values.map(value => <option key={value.key}
                                           value={value.key}>{value.value}</option>)}
      </FormControl>
    </FormGroup>
  );
};

export {
  TextInput,
  PasswordInput,
  OptionsInput
};