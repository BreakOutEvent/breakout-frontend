import React, { useState, useEffect, useRef } from 'react';
import { Button, Switch } from '@material-ui/core';
import EditEventModal from './EditEventModal.jsx';
import axios from 'axios';
import { CSVLink } from 'react-csv';

export default function AdminEventRow(props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setIsLoading] = useState(false);
  const [listOfUsers, setListOfUsers] = useState([]);

  const [event, setEvent] = useState(props.event);
  const hasChanged = useRef(false);
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

  const accessToken = window.boUserData.access_token;
  const apiUrl = window.boClientConfig.baseUrl;

  const getUsers = async (event, done) => {
    if (loading) {
      return done(false);
    }

    setIsLoading(true);
    try {
      const userListJson = await axios.get(
        `${apiUrl}/event/${event.id}/participants/`,
        { headers: { authorization: `Bearer ${accessToken}` } }
      );
      setListOfUsers(userListJson.data);
      done();
    } catch (e) {
      console.error(e);
      done(false);
    } finally {
      setIsLoading(false);
    }
  };

  const headers = [
    { label: 'ID', key: 'id' },
    { label: 'Vorname', key: 'firstname' },
    { label: 'Nachname', key: 'lastname' },
    { label: 'Geschlecht', key: 'gender' },
    { label: 'Event ID', key: 'eventId' },
    { label: 'Stadt', key: 'eventCity' },
    { label: 'Team ID', key: 'teamId' },
    { label: 'Team Name', key: 'teamName' },
    { label: 'Tshirtgröße', key: 'tshirtsize' },
    { label: 'Email', key: 'email' },
    { label: 'Addresse', key: 'postaddress' },
  ];

  return (
    <tr>
      <td>{event.title}</td>
      <td>{event.city}</td>
      <td>{date.toLocaleString()}</td>
      <td>{event.duration} hours</td>
      <td>
        <Switch
          disabled={!props.canEdit}
          checked={event.isCurrent}
          onChange={(event, checked) => toggle({ isCurrent: checked })}
        />
      </td>
      <td>
        <Switch
          disabled={!props.canEdit}
          checked={event.openForRegistration}
          onChange={(event, checked) =>
            toggle({ openForRegistration: checked })
          }
        />
      </td>
      <td>
        <Switch
          disabled={!props.canEdit}
          checked={event.allowNewSponsoring}
          onChange={(event, checked) => toggle({ allowNewSponsoring: checked })}
        />
      </td>
      <td>
        <Button
          disabled={!props.canEdit}
          color='secondary'
          onClick={() => setIsDialogOpen(true)}
        >
          Edit
        </Button>
      </td>
      <td>
        <Button
          color='secondary'
          isLoading={loading}
          component={CSVLink}
          asyncOnClick={true}
          onClick={getUsers}
          data={listOfUsers}
          headers={headers}
          filename={`participants-${event.id}.csv`}
          target='_blank'
        >
          Download
        </Button>
      </td>

      <EditEventModal
        open={isDialogOpen}
        event={event}
        onChange={(event) => setEvent(event)}
        onClose={() => setIsDialogOpen(false)}
      />
    </tr>
  );
}
