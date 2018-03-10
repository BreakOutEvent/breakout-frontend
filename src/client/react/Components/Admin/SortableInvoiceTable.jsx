import React from 'react';
import InvoiceTable from './InvoiceTable.jsx';
import {SelectField} from 'material-ui';
import MenuItem from 'material-ui/MenuItem';
import {Card, CardText} from 'material-ui/Card';
import _ from 'lodash';

const SortingCriteria = {
  Firstname: 1,
  Lastname: 2,
  Amount: 3,
  Payed: 4,
  InvoiceId: 5
};

const Order = {
  Ascending: 0,
  Descending: 1
};

export default class SortableInvoiceTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      sortBy: SortingCriteria.Lastname,
      order: Order.Ascending
    };
  }

  handleChange(target, event, index, value) {

    if(target === 'event') {
      this.props.eventSelected(value);
    }

    this.setState({
      [target]: value
    });
  }

  sortData() {
    const sortOrder = (this.state.order === Order.Ascending) ? 'asc' : 'desc';

    let sortKey;
    switch (this.state.sortBy) {
      case SortingCriteria.Firstname:
        sortKey = 'sponsor.firstname';
        break;
      case SortingCriteria.Lastname:
        sortKey = 'sponsor.lastname';
        break;
      case SortingCriteria.Amount:
        sortKey = 'amount';
        break;
      case SortingCriteria.Payed:
        sortKey = 'payed';
        break;
      case SortingCriteria.InvoiceId:
        sortKey = 'id';
        break;
      default:
        console.warn(`Unknown key for sorting ${this.state.sortBy}`);
        sortKey = 'id';
    }
    return _.orderBy(this.props.data, [sortKey], [sortOrder]);
  }

  render() {
    return (
      <div>
        <Card>
          <CardText>
            <SelectField
              style={{width: '150px'}}
              floatingLabelText="Sortieren nach"
              value={this.state.sortBy}
              onChange={(event, index, value) => this.handleChange('sortBy', event, index, value)}>
              <MenuItem value={SortingCriteria.InvoiceId} primaryText='Invoice-ID'/>
              <MenuItem value={SortingCriteria.Lastname} primaryText='Nachname'/>
              <MenuItem value={SortingCriteria.Firstname} primaryText='Vorname'/>
              <MenuItem value={SortingCriteria.Amount} primaryText='Betrag'/>
              <MenuItem value={SortingCriteria.Payed} primaryText='Bezahlt'/>
            </SelectField>
            <SelectField
              style={{width: '150px'}}
              floatingLabelText="Reihenfolge"
              value={this.state.order}
              onChange={(event, index, value) => this.handleChange('order', event, index, value)}>
              <MenuItem value={Order.Ascending} primaryText='Aufsteigend'/>
              <MenuItem value={Order.Descending} primaryText='Absteigend'/>
            </SelectField>
            <SelectField
              style={{width: '300px'}}
              floatingLabelText="Event"
              value={this.state.event}
              onChange={(event, index, value) => this.handleChange('event', event, index, value)}>
              {this.props.events.map((event, index) => <MenuItem key={index} value={event.id} primaryText={event.title} />)}
            </SelectField>
          </CardText>
        </Card>
        <br />
        <Card>
          <InvoiceTable data={this.sortData(this.props.data)}/>
        </Card>
      </div>
    );
  }

}