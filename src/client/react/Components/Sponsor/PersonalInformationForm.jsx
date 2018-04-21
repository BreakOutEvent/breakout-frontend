import React from 'react';
import Form from '../Form.jsx';
import Button from '../Button';

export default class PersonalInformationForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      formData: {}
    };
  }

  render() {
    const i18next = this.props.i18next;

    const schema = {
      type: 'object',
      properties: {
        firstname: {
          type: 'string',
          title: i18next.t('client.sponsor.firstname')
        },
        lastname: {
          type: 'string',
          title: i18next.t('client.sponsor.lastname')
        },
        street: {
          type: 'string',
          title: i18next.t('client.sponsor.street')
        },
        postcode: {
          type: 'string',
          title: i18next.t('client.sponsor.postcode')
        },
        city: {
          type: 'string',
          title: i18next.t('client.sponsor.city')
        },
        country: {
          type: 'string',
          title: i18next.t('client.sponsor.country')
        }
      },

      required: ['firstname', 'lastname', 'street', 'postcode', 'city', 'country'],
    };

    const uiSchema = {};

    return (
      <Form schema={schema}
            uiSchema={uiSchema}
            showErrorList={true}
            formData={this.state.formData}
            onChange={(data) => this.setState({formData: data.formData})}
            onSubmit={this.props.onSubmit}>
        <Button className="primary">Next</Button>
        <div></div>
        <div></div>
        {/*{this.props.children}*/}
      </Form>
    );

  }
}