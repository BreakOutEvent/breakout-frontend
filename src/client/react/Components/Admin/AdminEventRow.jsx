import React, { useState, useEffect, useRef } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, FormControlLabel, Checkbox,
  FormHelperText, CircularProgress, TextField, withMobileDialog, Switch
} from '@material-ui/core';

const sampleEvent = {
  title: 'Sample Event',
  city: 'Munich',
  date: new Date(),
  duration: 36,
  latitude: 48.150676,
  longitude: 11.580984,
  isCurrent: false,
  isOpenForRegistration: false,
  allowNewSponsoring: false,
};

function Modal(props) {
  const [event, setEvent] = useState(props.event || sampleEvent);

  const save = async (e) => {
    if (e) e.preventDefault();
    props.onChange(event);
    props.onClose();
  };

  return (
    <Dialog
      open={props.open}
      fullScreen={false}
      onClose={props.onClose}>
      <form onSubmit={save}>
        <DialogTitle id="event-details">Event Details</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Title"
            fullWidth
            value={event.title}
            onChange={change => setEvent({ ...event, title: change.target.value })}
          />
          <TextField
            autoFocus
            label="City"
            fullWidth
            value={event.city}
            onChange={change => setEvent({ ...event, city: change.target.value })}
          />
          <Switch
            label="Is Current"
            checked={event.isCurrent}
            onChange={(change, checked) => setEvent({ ...event, isCurrent: checked })}
          />
          <Switch
            label="Is Open for Registration"
            checked={event.openForRegistration}
            onChange={(change, checked) => setEvent({ ...event, openForRegistration: checked })}
          />
          <Switch
            label="Allows new sponsorings"
            checked={event.allowNewSponsoring}
            onChange={(change, checked) => setEvent({ ...event, allowNewSponsoring: checked })}
          />
        </DialogContent>
        <DialogActions style={{ justifyContent: 'flex-end' }}>
          <Button onClick={props.onClose} color="primary">
            Cancel
                    </Button>
          <Button type="submit" color="primary">
            Save
                    </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

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

      <Modal open={isDialogOpen} event={event} onChange={event => setEvent(event)} onClose={() => setIsDialogOpen(false)} />
    </tr>
  );
}