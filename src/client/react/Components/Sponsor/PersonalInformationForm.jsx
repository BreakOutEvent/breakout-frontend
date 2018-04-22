import React from 'react';
import Form from '../Form.jsx';
import Button from '../Button.jsx';

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
        housenumber: {
          type: 'string',
          title: i18next.t('client.sponsor.housenumber')
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

      required: ['firstname', 'lastname', 'street', 'housenumber', 'postcode', 'city', 'country'],
    };

    const uiSchema = {};
    return (
      <Form schema={schema}
            uiSchema={uiSchema}
            showErrorList={true}
            formData={this.props.formData}
            onSubmit={this.props.onSubmit}>
        <Button className="primary">{i18next.t('client.sponsor.continue')}</Button>
        <div></div>
        {/*{this.props.children}*/}
      </Form>
    );

  }
}