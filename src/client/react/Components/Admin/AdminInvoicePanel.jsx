import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, {selectFilter, textFilter} from 'react-bootstrap-table2-filter';
import InvoiceFilterSearchForm from './InvoiceFilterSearchForm.jsx';

const customTextFilter = textFilter({
  delay: 1,
  style: {
    marginBottom: '-7px',
    paddingLeft: 0,
    height: '30px',
    fontSize: 'smaller',
    fontWeight: 'normal'
  }
});

const Invoice = (props) => {

  const columns = [{
    dataField: 'team',
    text: 'Team'
  }, {
    dataField: 'description',
    text: 'Beschreibung'
  }, {
    dataField: 'status',
    text: 'Status'
  }, {
    dataField: 'amount',
    text: 'Betrag'
  }, {
    dataField: 'billableAmount',
    text: 'In Rechnung gestellt'
  }];

  const sponsoringColumns = [{
    dataField: 'team',
    text: 'Team'
  }, {
    dataField: 'amountPerKm',
    text: 'Betrag pro Km'
  }, {
    dataField: 'limit',
    text: 'Limit'
  }, {
    dataField: 'status',
    text: 'Status'
  }, {
    dataField: 'billableAmount',
    text: 'In Rechnung gestellt'
  }];

  let typeText;
  switch (props.type) {
    case 'DONOR':
      typeText = 'Spender';
      break;
    case 'ACTIVE':
      typeText = 'Aktiver Sponsor';
      break;
    case 'PASSIVE':
      typeText = 'Passiver Sponsor';
      break;
    default:
      typeText = 'Spender oder Sponsor nicht hinterlegt';
  }

  return (
    <div className="panel panel-default">
      <div className="panel-heading">
        <strong>{props.sponsor.firstname} {props.sponsor.lastname}</strong><br/>
        <small> {typeText} – {props.sponsor.email}</small>
      </div>

      <div className="panel-body">
        <strong>Firma</strong>
        <p>
          {props.sponsor.company} – <a href={props.sponsor.url}>{props.sponsor.url}</a>
        </p>

        <strong>Anschrift</strong>
        <p>
          {props.sponsor.address.street} {props.sponsor.address.housenumber} <br/>
          {props.sponsor.address.city}, {props.sponsor.address.country}
        </p>

        <strong>Verwendungszweck</strong>
        <p>
          <code>{props.purposeOfTransfer}</code>
        </p>

        <strong>Betrag (ohne mögliche Steuer!)</strong>
        <p>
          Betrag: {props.amount.toFixed(2)} €<br/>
          Bezahlt: {props.payed.toFixed(2)} €<br/>
          Noch offen: {(props.amount - props.payed).toFixed(2)} €
        </p>

        <h4>Challenges</h4>

        <BootstrapTable
          keyField="id"
          data={props.challenges || []}
          columns={columns}
          striped
          condensed
        />

        <h4>Sponsorings</h4>

        <BootstrapTable
          keyField="id"
          data={props.sponsorings || []}
          columns={sponsoringColumns}
          striped
          condensed
        />

      </div>
    </div>
  );
};

export default class AdminInvoicePanel extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      data: [],
      events: []
    };
  }

  onSearch(query) {
    this.setState({ isLoading: true });
    this.props.api.searchInvoices(query)
      .then(data => this.setState({ data, isLoading: false }))
      .catch(err => this.setState({ error: err, isLoading: false }));
  }

  render() {
    let selectedInvoice;
    if (this.state.data && this.state.selectedInvoiceId) {
      selectedInvoice = this.state.data.filter(invoice => invoice.id === this.state.selectedInvoiceId)[0];
    }

    const selectRow = {
      mode: 'radio',
      clickToSelect: true,
      selected: [this.state.selectedInvoiceId],
      onSelect: (row, isSelect, rowIndex, e) => {
        this.setState({
          selectedInvoiceId: row.id
        });
      }
    };

    const columns = [{
      dataField: 'sponsor',
      text: 'Name',
      formatter: sponsorFormatter
    }, {
      dataField: 'type',
      text: 'Art'
    }, {
      dataField: 'amount',
      text: 'Spenden versprechen', // There is this ugly space in there for now to allow this to break line
      formatter: euroFormatter,
    }, {
      dataField: 'payed',
      text: 'Bereits bezahlt'
    }];

    if (this.state.error) {
      return (<div>Something wrent wrong loading invoices: {this.state.error.message}</div>);
    } else {
      return (
        <div>
          <InvoiceFilterSearchForm onSearch={this.onSearch.bind(this)} api={this.props.api} isLoading={this.state.isLoading}/>
          <div style={{display: 'flex'}}>
            <div style={{flex: 1, marginRight: '10px'}}>
                <BootstrapTable
                  keyField="id"
                  data={this.state.data}
                  columns={columns}
                  filter={filterFactory()}
                  selectRow={selectRow}
                  striped
                  condensed
                />
            </div>
            {selectedInvoice && <div style={{flex: 1}}><Invoice {...selectedInvoice} /></div>}
          </div>
        </div>
      );
    }
  }
}

function sponsorFormatter(sponsor) {
  const {
    firstname,
    lastname
  } = sponsor;

  return `${firstname} ${lastname}`;
}

function euroFormatter(number) {
  if (isNaN(number)) {
    throw Error(`expected a number but got ${number}`);
  }

  return number.toFixed(2) + '€';
}