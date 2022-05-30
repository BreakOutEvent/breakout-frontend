import React, { useState, useEffect, useRef } from 'react';
import { Button, Switch } from '@material-ui/core';
import EditEventModal from './EditEventModal.jsx';
import getEntryList from './ExportCSV.jsx';

export default function AdminEventRow(props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      <Button disabled={!props.canEdit} color="secondary" onClick={() => getEntryList(true)}>Download</Button>
      </td>

      <EditEventModal open={isDialogOpen} event={event} onChange={event => setEvent(event)} onClose={() => setIsDialogOpen(false)} />
    </tr>
  );
}