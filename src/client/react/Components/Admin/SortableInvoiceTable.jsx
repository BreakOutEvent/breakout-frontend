import React from 'react';
import InvoiceTable from './InvoiceTable.jsx';
import {MenuItem} from 'material-ui/Menu';
import Select from 'material-ui/Select';
import Card, {CardContent} from 'material-ui/Card';
import {FormControl, FormHelperText} from 'material-ui/Form';
import Input, {InputLabel} from 'material-ui/Input';
import Paper from 'material-ui/Paper';
import _ from 'lodash';
import {withStyles} from 'material-ui/styles/index';

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

class SortableInvoiceTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      sortBy: SortingCriteria.Lastname,
      order: Order.Ascending,
      event: -1
    };
  }

  handleChange(target, event, index, value) {

    if (event.target.name === 'event') {
      this.props.eventSelected(event.target.value);
    }

    this.setState({
      [event.target.name]: event.target.value
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
      <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
        <Paper style={{padding: '20px', minWidth: '400px', maxWidth: '800px'}}>
          <form autoComplete="off">

            <FormControl>
              <InputLabel htmlFor="sortBy">Sortieren nach</InputLabel>
              <Select
                value={this.state.sortBy}
                onChange={(event, index, value) => this.handleChange('sortBy', event, index, value)}
                inputProps={{name: 'sortBy', id: 'sortBy'}}>
                <MenuItem value={SortingCriteria.InvoiceId}>Invoice-Id</MenuItem>
                <MenuItem value={SortingCriteria.Lastname}>Nachname</MenuItem>
                <MenuItem value={SortingCriteria.Firstname}>Vorname</MenuItem>
                <MenuItem value={SortingCriteria.Amount}>Betrag</MenuItem>
                <MenuItem value={SortingCriteria.Payed}>Bezahlt</MenuItem>
              </Select>
            </FormControl>

            <FormControl>
              <InputLabel htmlFor="order">Reihenfolge</InputLabel>
              <Select
                value={this.state.order}
                onChange={(event, index, value) => this.handleChange('order', event, index, value)}
                inputProps={{name: 'order', id: 'order'}}>
                <MenuItem value={Order.Ascending}>Aufsteigend</MenuItem>
                <MenuItem value={Order.Descending}>Absteigend</MenuItem>
              </Select>
            </FormControl>

            <FormControl>
              <InputLabel htmlFor="event">Event</InputLabel>
              <Select
                value={this.state.event}
                onChange={(event, index, value) => this.handleChange('event', event, index, value)}
                inputProps={{name: 'event', id: 'event'}}>
                <MenuItem value={-1}>Event auswählen</MenuItem>
                {this.props.events.map((event, index) => <MenuItem key={index}
                                                                   value={event.id}>{event.title}</MenuItem>)}
              </Select>
            </FormControl>
          </form>

        </Paper>
        <br/>
        <Paper style={{maxWidth: '800px', minWidth: '400px'}}>
          <InvoiceTable data={this.sortData(this.props.data)}/>
        </Paper>
      </div>
    );
  }
}

export default withStyles({})(SortableInvoiceTable);