import React from 'react';
import Form from '../Form.jsx';
import Button from '../Button.jsx';
import {Card, CardText} from 'material-ui/Card';

export default class CompanyInformationForm extends React.Component {

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
        supporterType: {
          title: 'Art der Unterstützung auswählen',
          type: 'string',
          enum: ['donor', 'passive', 'active'],
          enumNames: ['Spender', 'passiver Sponsor', 'aktiver Sponsor'],
        }
      },
      required: ['supporterType'],
      dependencies: {
        supporterType: {
          oneOf: [
            {
              properties: {
                supporterType: {
                  enum: ['donor']
                }
              }
            },
            {
              properties: {
                supporterType: {
                  enum: ['passive']
                },
                company: {
                  type: 'string',
                  title: i18next.t('client.sponsor.company')
                },
                logo: {
                  type: 'string',
                  format: 'data-url',
                  title: i18next.t('client.sponsor.logo')
                },
              },
              required: ['company', 'logo']
            },
            {
              properties: {
                supporterType: {
                  enum: ['active']
                },
                company: {
                  type: 'string',
                  title: i18next.t('client.sponsor.company')
                },
                url: {
                  type: 'string',
                  format: 'uri',
                  title: i18next.t('client.sponsor.url')
                },
                logo: {
                  type: 'string',
                  format: 'data-url',
                  title: i18next.t('client.sponsor.logo')
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
        Im folgenden können Sie auswählen, in welcher Form Sie ein oder mehrere Teams und damit den
        unseren Spendenpartner OneDollarGlasses e. V. unterstützen wollen
        <br/>
        <h5>Spender</h5>
        Als Spender wandern 100% des gespendeten Geldes an den EinDollarGlasses e. V. und es wird ihnen vom
        BreakOut e. V. eine Spendenquittung oder ein vereinfachter Spendennachweis ausgestellt.
        <br/>
        <h5>Passiver Sponsor</h5>
        Als passiver Sponsor können Sie ihren Firmennamen so wie ein Logo auf der Website platzieren. Sie bekommen
        vom BreakOut e. V. eine Rechnung ausgestellt, aber es wird keine Umsatzsteuer fällig. 100% des Betrags gehen
        an den EinDollarGlasses e. V.
        <br/>
        <h5>Aktiver Sponsor</h5>
        Als aktiver Sponsor können Sie ihren Firmennamen, einen Link zur Firmenwebsite so wie optional ein Logo
        hochgeladen werden. Sie bekommen vom BreakOut e. V. dann eine Rechnung ausgestellt, auf der eine Umsatzsteuer
        von
        19% ausgewiesen wird. Der bezahlte Betrag, abzüglich der Umsatzsteuer, geht vollständig an den EinDollarGlasses
        e. V.
        <br/>
        <br/>
        <Form schema={schema}
              uiSchema={uiSchema}
              showErrorList={false}
              formData={this.state.formData}
              onChange={(data) => this.setState({formData: data.formData})}
              onSubmit={this.props.onSubmit}>
          <Button className="primary" onClick={this.props.next}>Next</Button>
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