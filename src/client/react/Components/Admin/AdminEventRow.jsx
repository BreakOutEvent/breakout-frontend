import React, { useState, useEffect, useRef } from 'react';
import { Button, Switch } from '@material-ui/core';
import EditEventModal from './EditEventModal.jsx';
import axios from "axios";
import { CSVLink } from "react-csv";

export default function AdminEventRow(props) {
  const [isDialogOpen, setIsDialogOpen,] = useState(false);
  const [loading, setIsLoading] = useState(false);
  const [listOfUsers, setListOfUsers] = useState([]);

  const [event, setEvent] = useState(props.event);
  const hasChanged = useRef(false);
  const csvLink = useRef();

  const date = new Date(event.date * 1000);

  const toggle = (property) => {
    setEvent({ ...event, ...property });
  };

  useEffect(() => {
    if (hasChanged.current) {
      props.api.updateEvent(event);
    }
    hasChanged.current = true;
  }, [event]);

  const getUsers = async () => {
    if (!loading) {
      setIsLoading(true);

      await axios.get("http://localhost:8082/user/")
        .then((userListJson) => {
          setListOfUsers(userListJson.data);
          setIsLoading(false);
        }).catch((e) => {
          setIsLoading(false);
          console.log(e);
        });
      csvLink.current.link.click();
    }
  }

  const headers = [
    { label: "Vorname", key: "firstname" },
    { label: "Nachname", key: "lastname" },
    { label: "Geschlecht", key: "gender" },
    { label: "ID", key: "id" },
    { label: "Event ID", key: "participant.eventId" },
    { label: "Stadt", key: "participant.eventCity" },
    { label: "Team ID", key: "participant.teamId" },
    { label: "Team Name", key: "participant.teamName" },
    { label: "Tshirtgröße", key: "participant.tshirtSize" },
    { label: "Email", key: "email"},
    { label: "Address", key: "postaddress"}
  ];



  return (
    <tr>
      <td>
        {event.title}
      </td>
      <td>
        {event.city}
      </td>
      <td>
        {date.toLocaleString()}
      </td>
      <td>
        {event.duration} hours
      </td>
      <td>
        <Switch disabled={!props.canEdit} checked={event.isCurrent} onChange={(event, checked) => toggle({ isCurrent: checked })} />
      </td>
      <td>
        <Switch disabled={!props.canEdit} checked={event.openForRegistration} onChange={(event, checked) => toggle({ openForRegistration: checked })} />
      </td>
      <td>
        <Switch disabled={!props.canEdit} checked={event.allowNewSponsoring} onChange={(event, checked) => toggle({ allowNewSponsoring: checked })} />
      </td>
      <td>
        <Button disabled={!props.canEdit} color="secondary" onClick={() => setIsDialogOpen(true)}>Edit</Button>
      </td>
      <td>
        <Button onClick={getUsers}>Download</Button>
        <CSVLink
          data={listOfUsers}
          headers={headers}
          filename='transactions.csv'
          ref={csvLink}
          className='hidden'
          target='_blank'
        />
      </td>

      <EditEventModal open={isDialogOpen} event={event} onChange={event => setEvent(event)} onClose={() => setIsDialogOpen(false)} />
    </tr>
  );
}