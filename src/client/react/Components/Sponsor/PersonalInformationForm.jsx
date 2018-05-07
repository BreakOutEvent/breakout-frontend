import React from 'react';
import Form from '../Form.jsx';
import Button from '../Button.jsx';
import {BooleanWithInnerHtml} from '../Participate/ParticipationForm.jsx';

export default class PersonalInformationForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      formData: {}
    };
  }

  render() {
    const t = content => this.props.i18next.t(`client.sponsor.${content}`);
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
        },
        acceptToS: {
          type: 'boolean',
          title: t('accept_tos')
        },
        is18: {
          type: 'boolean',
          title: t('is_18')
        }
      },
      required: ['firstname', 'lastname', 'street', 'housenumber', 'postcode', 'city', 'country', 'acceptToS', 'is18'],
    };

    const uiSchema = {
      acceptToS: {
        'ui:widget': BooleanWithInnerHtml,
        classNames: 'boolean-with-inner-html'
      },
    };
    return (
      <Form schema={schema}
            uiSchema={uiSchema}
            showErrorList={true}
            formData={this.props.formData}
            onSubmit={this.props.onSubmit}>
        <Button className="primary">{t('continue')}</Button>
        <div></div>
        {/*{this.props.children}*/}
      </Form>
    );

  }
}