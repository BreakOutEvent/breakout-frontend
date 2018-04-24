import React from 'react';
import Form from '../Form.jsx';
import Button from '../Button.jsx';
import {Card, CardText} from 'material-ui/Card';

const DONOR = 'DONOR'
const PASSIVE = 'PASSIVE'
const ACTIVE = 'ACTIVE'

export default class CompanyInformationForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      formData: this.props.formData || {}
    };
  }

  render() {
    const t = content => this.props.i18next.t(`client.sponsor.${content}`)
    const schema = {
      type: 'object',
      properties: {
        supporterType: {
          title: t('supporterData.selectionLabel'),
          type: 'string',
          enum: [DONOR, PASSIVE, ACTIVE],
          enumNames: [
            t('supporterData.donor.title'),
            t('supporterData.passive.title'),
            t('supporterData.active.title')],
        }
      },
      required: ['supporterType'],
      dependencies: {
        supporterType: {
          oneOf: [
            {
              properties: {
                supporterType: {
                  enum: [DONOR]
                }
              }
            },
            {
              properties: {
                supporterType: {
                  enum: [PASSIVE]
                },
                company: {
                  type: 'string',
                  title: t('company')
                },
                logo: {
                  type: 'string',
                  format: 'data-url',
                  title: t('logo')
                },
              },
              required: ['company', 'logo']
            },
            {
              properties: {
                supporterType: {
                  enum: [ACTIVE]
                },
                company: {
                  type: 'string',
                  title: t('company')
                },
                url: {
                  type: 'string',
                  format: 'uri',
                  title: t('url')
                },
                logo: {
                  type: 'string',
                  format: 'data-url',
                  title: t('logo')
                }
              },
              required: ['company', 'url']
            }
          ]
        }
      }
    };

    const uiSchema = {
      url: {
        'ui:widget':'uri'
      }
    };

    return (
      <div>
        <p>{t('supporterData.selectionText')}</p>
        <b>{t('supporterData.donor.title')}</b>
        <p>{t('supporterData.donor.description')}</p>
        <b>{t('supporterData.passive.title')}</b>
        <p>{t('supporterData.passive.description')}</p>
        <b>{t('supporterData.active.title')}</b>
        <p>{t('supporterData.active.description')}</p>
        <Form schema={schema}
              uiSchema={uiSchema}
              showErrorList={false}
              formData={this.state.formData}
              onSubmit={this.props.onSubmit}>
          <Button className="primary" onClick={this.props.next}>{t('continue')}</Button>
          <div></div>
          { this.props.errorMessage &&
          <div className="alert alert-danger">
            {this.props.errorMessage}
          </div>}
          <div></div>
          {/*{this.props.children}*/}
        </Form>
      </div>
    );
  }
}