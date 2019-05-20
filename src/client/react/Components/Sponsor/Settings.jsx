import React from 'react';
import Form from '../Form.jsx';
import Button from '../Button.jsx';
import routes from '../routes';

const DONOR = 'DONOR';
const PASSIVE = 'PASSIVE';
const ACTIVE = 'ACTIVE';

export default class SponsorSettings extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      sponsorData: null,
      isSubmitting: false
    };
  }

  componentDidMount() {
    this.props.api.getMe()
      .then(me => { this.setState({
        me,
        sponsorData: {
          firstname: me.firstname,
          lastname: me.lastname,
          street: me.sponsor.address.street,
          housenumber: me.sponsor.address.housenumber,
          postcode: me.sponsor.address.zipcode,
          city: me.sponsor.address.city,
          country: me.sponsor.address.country,
          supporterType: me.sponsor.supporterType,
          company: me.sponsor.company,
          url: me.sponsor.url,
          hidden: me.sponsor.hidden
        }
      });})
      .catch(this.onGetMeError.bind(this));
  }

  onGetMeError(_) {
    this.props.history.push(routes.login);
  }

  async onSubmit(data) {
    this.onBeginSubmit();
    await this.onSubmitImpl(data);
    this.onEndSubmit();
  }

  onBeginSubmit() {
    this.setState({
      isSubmitting: true,
      registrationError: undefined
    });
  }

  onEndSubmit() {
    this.setState({
      isSubmitting: false
    });
  }

  async onSubmitImpl(data) {
    try {
      let formData = data.formData;
      let sponsorData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        sponsor: {
          hidden: formData.hidden,
          company: formData.company,
          url: formData.url,
          supporterType: formData.supporterType,
          address: {
            street: formData.street,
            housenumber: formData.housenumber,
            city: formData.city,
            zipcode: formData.postcode,
            country: formData.country
          }
        }
      };

      // upload company logo to Cloudinary
      if (formData.logo) {
        const signedParams = await this.props.api.signCloudinaryParams();

        const upload = await this.props.api.uploadImage(formData.logo, signedParams);
        sponsorData.sponsor.logo = {
          type: 'IMAGE',
          url: upload.secure_url
        };
      }
      const sponsor = await this.props.api.updateUserData(this.state.me.id, sponsorData);
      if (!sponsor) throw new Error('Sponsor creation failed!');
      window.location.reload();
    } catch (error) {
      this.onRegistrationError(error);
      return;
    }
  }

  onRegistrationError(error) {
    let message = error.message;
    if (error.response && error.response.status === 409) {
      message = this.props.i18next.t('client.login.registration_error_exists');
    }
    this.setState({
      registrationError: message
    });
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
        supporterType: {
          title: t('supporterData.selectionLabel'),
          type: 'string',
          enum: [DONOR, PASSIVE, ACTIVE],
          enumNames: [
            t('supporterData.donor.title'),
            t('supporterData.passive.title'),
            t('supporterData.active.title')],
        },
        hidden: {
          type: 'boolean',
          title: t('hidden')
        }
      },
      required: ['supporterType', 'firstname', 'lastname', 'street', 'housenumber', 'postcode', 'city', 'country'],
      dependencies: {
        supporterType: {
          oneOf: [
            {
              properties: {
                supporterType: {
                  enum: [DONOR]
                },
                company: {
                  type: 'string',
                  title: t('company')
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
      'supporterType': {
        'ui:disabled': (this.state.sponsorData && this.state.sponsorData.supporterType != null)
      }
    };
    return (
      <div>
        {(!this.state.sponsorData
          ? <div className={'loading'}>{t('isLoadingMe')}...</div>
          : <div>
              <Form schema={schema}
                    uiSchema={uiSchema}
                    showErrorList={true}
                    formData={this.state.sponsorData}
                    onSubmit={this.onSubmit.bind(this)}
                    >
                {this.state.me.sponsor.logo && <img src={this.state.me.sponsor.logo.url}
                     className={'bo-sponsor-logo'} />}
                     <br />
                <Button className="primary btn btn-primary btn-block text-uppercase">{(this.state.isSubmitting ? '...' : t('save'))}</Button>
              </Form>
          </div>
        )}
      </div>
    );
  }
}
