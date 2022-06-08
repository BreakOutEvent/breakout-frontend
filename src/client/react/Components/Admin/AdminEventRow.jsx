import React, { useState, useEffect, useRef } from 'react';
import { Button, Switch } from '@material-ui/core';
import EditEventModal from './EditEventModal.jsx';
import axios from 'axios';
import csvDownload from 'json-to-csv-export';

const CSV_HEADER_MAPPING = [
  { label: 'ID', key: 'id' },
  { label: 'Vorname', key: 'firstname' },
  { label: 'Nachname', key: 'lastname' },
  { label: 'Geschlecht', key: 'gender' },
  { label: 'T-Shirt-Größe', key: 'tshirtsize' },
  { label: 'Email', key: 'email' },
  { label: 'Adresse', key: 'postaddress' },
  { label: 'Event-ID', key: 'eventId' },
  { label: 'Event-Stadt', key: 'eventCity' },
  { label: 'Team-ID', key: 'teamId' },
  { label: 'Team-Name', key: 'teamName' },
];

export default function AdminEventRow(props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setIsLoading] = useState(false);

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

  const getUsers = async () => {
    if (loading) {
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${apiUrl}/event/${event.id}/participants/`,
        { headers: { authorization: `Bearer ${accessToken}` } }
      );
      const csvData = data.map(row => {
        const entries = CSV_HEADER_MAPPING.map(({ key, label }) => ([label, row[key]]));
        return Object.fromEntries(entries);
      });
      csvDownload(csvData, `event-${event.id}-${new Date().toISOString()}.csv`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

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
          onClick={getUsers}
          disabled={loading}
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
