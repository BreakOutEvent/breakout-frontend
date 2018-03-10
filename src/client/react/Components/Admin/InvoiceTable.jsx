import React from 'react';
import {Table, TableHeader, TableHeaderColumn, TableRow} from 'material-ui/Table';
import {TableBody, TableRowColumn} from 'material-ui/Table/index';

export default class InvoiceTable extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.data ||this.props.data.length === 0) {
      return <div style={{padding: '10px'}}>Loading...</div>;
    }

    return (
      <Table height='900px'
             showRowHover={true}
             fixedHeader={false} style={{tableLayout: 'auto'}}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn>Invoice-ID</TableHeaderColumn>
            <TableHeaderColumn>Sponsor</TableHeaderColumn>
            <TableHeaderColumn>Betrag</TableHeaderColumn>
            <TableHeaderColumn>Bezahlt</TableHeaderColumn>
            <TableHeaderColumn>Betrag eintragen</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody>
          {this.props.data.map((row, index) => <InvoiceRow key={index} {...row}/>)}
        </TableBody>
      </Table>
    );
  }
}

const InvoiceRow = (props) => {

  const emailLink = `/admin/emails?emailAddress=${props.sponsor.email}`;
  const name = (
    <span style={{fontSize: 'xx-small'}}>
      {props.sponsor.firstname} {props.sponsor.lastname}<br/>
      <a href={emailLink}>{props.sponsor.email}</a><br/>
      {props.purposeOfTransfer}<br/>
      {props.sponsor.address.street} {props.sponsor.address.housenumber} <br/>
      {props.sponsor.address.zipcode} {props.sponsor.address.city} <br/>
      {props.sponsor.address.country}
    </span>
  );

  return (
    <TableRow>
      <TableRowColumn>{props.id}</TableRowColumn>
      <TableRowColumn>{name}</TableRowColumn>
      <TableRowColumn>{props.amount.toFixed(2)}€</TableRowColumn>
      <TableRowColumn>{props.payed.toFixed(2)}€</TableRowColumn>
      <TableRowColumn>Work in Progress</TableRowColumn>
    </TableRow>
  );
};