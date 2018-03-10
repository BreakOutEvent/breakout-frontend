import React from 'react';
import SortableInvoiceTable from './SortableInvoiceTable.jsx';

export default class AdminInvoicePanel extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      events: []
    };
  }

  componentDidMount() {
    this.props.api.getAllEvents()
      .then(events => this.setState({events: events}))
      .catch(err => this.setState({error: err}));
  }

  eventSelected(eventId) {
    this.props.api.fetchInvoicesForEvent(eventId)
      .then(data => this.setState({data: data}))
      .catch(err => this.setState({error: err}));
  }

  render() {
    if (this.state.error) {
      return (<div>Something wrent wrong loading invoices: {this.state.error.message}</div>);
    } else {
      return (<SortableInvoiceTable
        data={this.state.data}
        eventSelected={this.eventSelected.bind(this)}
        events={this.state.events}
      />);
    }
  }
}