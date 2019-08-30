import React, { useState, useEffect, useRef } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, TextField, Switch, Grid, MuiThemeProvider
} from '@material-ui/core';

import {DateFormatInput, TimeFormatInput} from 'material-ui-next-pickers';

import LocationPicker from 'react-location-picker';

export default function EditEventModal(props) {
  const [event, setEvent] = useState(props.event);
  const [date, setDate] = useState(new Date(event.date * 1000));
  const [address, setAddress] = useState(null);
  const [location, setLocation] = useState({ lat: props.event.startingLocation.latitude, lng: props.event.startingLocation.longitude });

  useEffect(() => {
    setEvent({ ...event, date: date.getTime() / 1000 });
  }, [date]);

  useEffect(() => {
    setEvent({ ...event, startingLocation: { latitude: location.lat, longitude: location.lng } });
  }, [location]);

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
          <Grid container spacing={8} alignItems="stretch">
            <Grid item xs={12}>
              <TextField
                autoFocus
                label="Title"
                value={event.title}
                onChange={change => setEvent({ ...event, title: change.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="City"
                value={event.city}
                onChange={change => setEvent({ ...event, city: change.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Brand"
                value={event.brand}
                onChange={change => setEvent({ ...event, brand: change.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Fee"
                type="number"
                value={event.teamFee}
                onChange={change => setEvent({ ...event, teamFee: change.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              {address !== null && <h5>{address}</h5>}
              <LocationPicker
                defaultPosition={location}
                onChange={({ address, position }) => {
                  setAddress(address);
                  setLocation(position);
                }}
                radius={-1}
                zoom={15}
                containerElement={<div style={{ height: '100%' }} />}
                mapElement={<div style={{ height: '400px' }} />}
              />
            </Grid>
            <Grid item xs={6}>
              <DateFormatInput
                value={date}
                onChange={setDate}
                dateFormat="dd.MM.yyyy"
                InputLabelProps={{
                  shrink: false,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <div style={{}}></div>
              <TimeFormatInput
                value={date}
                onChange={setDate}
                InputLabelProps={{
                  shrink: false,
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={event.isCurrent}
                    onChange={(change, checked) => setEvent({ ...event, isCurrent: checked })}
                  />
                }
                label="Is Current"
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={event.openForRegistration}
                    onChange={(change, checked) => setEvent({ ...event, openForRegistration: checked })}
                  />
                }
                label="Is Open For Registraion"
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={event.allowNewSponsoring}
                    onChange={(change, checked) => setEvent({ ...event, allowNewSponsoring: checked })}
                  />
                }
                label="Allow new Sponsorings"
              />
            </Grid>
          </Grid>
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