import React from 'react';

import '!style-loader!css-loader!bootstrap/dist/css/bootstrap.css';
require('babel-core/register');
require('babel-polyfill');

import {storiesOf} from '@storybook/react';
import InvoiceTable from '../src/client/react/Components/Admin/InvoiceTable';
import {MuiThemeProvider} from 'material-ui';

// Place useful samples here, can't do that currently due to privacy reasons
// import InvoiceSampleData from './invoiceSampleData';
// import EventSampleData from './eventSampleData';

import SortableInvoiceTable from '../src/client/react/Components/Admin/SortableInvoiceTable';
import Sponsor from '../src/client/react/Components/Sponsor/Sponsor';
import de from '../src/common/resources/translations/translations.de';
import en from '../src/common/resources/translations/translations.en';
import i18next from 'i18next';

i18next.init({
  lng: 'de',
  fallbackLng: 'en',
  resources: {
    de: {
      translation: de
    },
    en: {
      translation: en
    }
  }
});

// storiesOf('Invoice Table', module)
  // .add('default', () => <MuiThemeProvider><InvoiceTable data={InvoiceSampleData}/></MuiThemeProvider>)
  // .add('search and sortable', () => <MuiThemeProvider><SortableInvoiceTable events={EventSampleData}
  //                                                                           data={InvoiceSampleData}
  //                                                                           eventSelected={() => {
  //                                                                           }}/></MuiThemeProvider>);

storiesOf('Sponsor Registration', module)
  .add('first form', () => <MuiThemeProvider><div style={{padding: '30px'}}><Sponsor i18next={i18next}/></div></MuiThemeProvider>);