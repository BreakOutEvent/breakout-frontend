import Form from '../Form.jsx';
import React from 'react';
import Button from '../Button.jsx';
import PropTypes from 'prop-types';

export const BooleanWithInnerHtml = (props) => {
  return (
    <span className="checkbox boolean-with-inner-html">
      <label>
        <input type="checkbox"
                value={props.value}
                required={props.required}
                onChange={(event) => props.onChange((event.target.value === 'checked'))}/>
        <span dangerouslySetInnerHTML={{__html: props.label}}></span>
      </label>
    </span>
  );
};

BooleanWithInnerHtml.propTypes = {
  value: PropTypes.bool,
  required: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired
};

export default class ParticipationForm extends React.Component {

  constructor(props) {
    super(props);
  }

  transformErrors(errors) {
    return errors;
  }

  render() {
    const i18next = this.props.i18next;
    const schema = {
      type: 'object',
      title: i18next.t('client.participate.title'),
      description: i18next.t('client.participate.description'),
      required: ['gender', 'firstname', 'lastname', 'tshirtSize', 'phonenumber', 'emergencynumber',
        'acceptToS', 'acceptCoH', 'is18'],
      properties: {
        gender: {
          type: 'string',
          title: i18next.t('client.participate.gender'),
          enumNames: [i18next.t('client.participate.male'), i18next.t('client.participate.female'), i18next.t('client.participate.diverse')],
          enum: ['male', 'female', 'diverse']
        },
        firstname: {
          type: 'string',
          title: i18next.t('client.participate.firstname.label')
        },
        lastname: {
          type: 'string',
          title: i18next.t('client.participate.lastname.label')
        },
        tshirtSize: {
          type: 'string',
          title: i18next.t('client.participate.tshirtsize.label'),
          enum: this.props.tshirtSizes
        },
        phonenumber: {
          type: 'string',
          title: i18next.t('client.participate.contactnumber.label')
        },
        emergencynumber: {
          type: 'string',
          title: i18next.t('client.participate.emergencynumber.label')
        },
        acceptToS: {
          type: 'boolean',
          title: i18next.t('client.participate.accept_tos')
        },
        acceptCoH: {
          type: 'boolean',
          title: i18next.t('client.participate.accept_code_of_honour')
        },
        is18: {
          type: 'boolean',
          title: i18next.t('client.participate.is_18')
        }
      }
    };

    const uiSchema = {
      gender: {
        'ui:widget': 'radio',
        'ui:options': {
          inline: true
        },
      },
      acceptToS: {
        'ui:widget': BooleanWithInnerHtml,
        classNames: 'boolean-with-inner-html'
      },
      acceptCoH: {
        'ui:widget': BooleanWithInnerHtml,
        classNames: 'boolean-with-inner-html'
      },
      is18: {
        'ui:widget': BooleanWithInnerHtml,
        classNames: 'boolean-with-inner-html'
      },
      tshirtSize: {
        'ui:placeholder': i18next.t('client.participate.tshirtsize.placeholder')
      }
    };

    return (
      <Form schema={schema}
            uiSchema={uiSchema}
            showErrorList={false}
            transformErrors={this.transformErrors}
            onChange={this.props.onChange}
            onSubmit={this.props.onSubmit}
            onError={this.props.onError}
            formData={this.props.formData}>

        { this.props.participationError &&
        <div className="alert alert-danger">
          {this.props.participationError}
        </div>
        }
        <Button id='register'
                className="btn btn-primary"
                type="submit"
                isLoading={this.props.isSubmitting}>
          {i18next.t('client.participate.next_step')}
        </Button>
      </Form>
    );
  }
}

ParticipationForm.propTypes = {
  i18next: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  participationError: PropTypes.string,
  isSubmitting: PropTypes.bool.isRequired,
  tshirtSizes: PropTypes.array.isRequired,
  formData: PropTypes.object
};