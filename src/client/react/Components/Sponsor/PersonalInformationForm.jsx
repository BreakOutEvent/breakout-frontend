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
    const t = content => this.props.i18next.t(`client.sponsor.${content}`)
    const schema = {
      type: 'object',
      properties: {
        firstname: {
          type: 'string',
          title: t('firstname')
        },
        lastname: {
          type: 'string',
          title: t('lastname')
        },
        street: {
          type: 'string',
          title: t('street')
        },
        housenumber: {
          type: 'string',
          title: t('housenumber')
        },
        postcode: {
          type: 'string',
          title: t('postcode')
        },
        city: {
          type: 'string',
          title: t('city')
        },
        country: {
          type: 'string',
          title: t('country')
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
        <Button className="primary">{t('client')}</Button>
        <div></div>
        {/*{this.props.children}*/}
      </Form>
    );

  }
}