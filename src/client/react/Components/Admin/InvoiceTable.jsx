import React from 'react';
import { withStyles } from 'material-ui/styles';
import Table, {TableBody, TableCell, TableHead, TableRow} from 'material-ui/Table';

class InvoiceTable extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.data || this.props.data.length === 0) {
      return <div style={{padding: '10px'}}>Loading...</div>;
    }

    return (
      <Table height='900px'>
        <TableHead>
          <TableRow>
            <TableCell>Invoice-ID</TableCell>
            <TableCell>Sponsor</TableCell>
            <TableCell>Betrag</TableCell>
            <TableCell>Bezahlt</TableCell>
            <TableCell>Betrag eintragen</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {this.props.data.map((row, index) => <InvoiceRow key={index} {...row}/>)}
        </TableBody>
      </Table>
    );
  }
}

function checkNullEmptyOrUndefined(elem) {
  if (!elem || elem === '') {
    return 'Keine';
  } else {
    return elem;
  }
}

const InvoiceRow = (props) => {

  const emailLink = `/admin/emails?emailAddress=${props.sponsor.email}`;
  const name = (
    <span style={{fontSize: 'xx-small'}}>
      <b>Name: </b> {props.sponsor.firstname} {props.sponsor.lastname}<br/>
      <b>Email: </b><a href={emailLink}>{props.sponsor.email}</a><br/>
      <b>Verwendungszweck: </b>{props.purposeOfTransfer}<br/>
      <b>Link </b>{checkNullEmptyOrUndefined(props.sponsor.url)}<br/>
      <b>Firma </b>{checkNullEmptyOrUndefined(props.sponsor.company)}
      <br/>
      <b>Adresse</b><br/>
      {props.sponsor.address.street} {props.sponsor.address.housenumber} <br/>
      {props.sponsor.address.zipcode} {props.sponsor.address.city} <br/>
      {props.sponsor.address.country}

      <br/>
    </span>
  );

  return (
    <TableRow>
      <TableCell>{props.id}</TableCell>
      <TableCell>{name}</TableCell>
      <TableCell>{props.amount.toFixed(2)}€</TableCell>
      <TableCell>{props.payed.toFixed(2)}€</TableCell>
      <TableCell>Work in Progress</TableCell>
    </TableRow>
  );
};

export default withStyles({})(InvoiceTable);