import React from 'react';

import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import {linkTo} from '@storybook/addon-links';

import {Button, Welcome} from '@storybook/react/demo';
import InvoiceTable from '../src/client/react/Components/Admin/InvoiceTable';
import {MuiThemeProvider} from "material-ui";

// Place useful samples here, can't do that currently due to privacy reasons
import InvoiceSampleData from './invoiceSampleData';
import EventSampleData from './eventSampleData';

import SortableInvoiceTable from "../src/client/react/Components/Admin/SortableInvoiceTable";


storiesOf('Invoice Table', module)
  .add('default', () => <MuiThemeProvider><InvoiceTable data={InvoiceSampleData}/></MuiThemeProvider>)
  .add('search and sortable', () => <MuiThemeProvider><SortableInvoiceTable events={EventSampleData}
                                                                            data={InvoiceSampleData}
                                                                            eventSelected={() => {}}/></MuiThemeProvider>);
