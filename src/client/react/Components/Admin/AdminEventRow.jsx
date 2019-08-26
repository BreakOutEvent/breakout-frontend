import React, { useState } from 'react';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, FormControlLabel, Checkbox,
    FormHelperText, CircularProgress, TextField, withMobileDialog, Switch
} from '@material-ui/core';

const sampleEvent = { 
    title: "Sample Event", 
    city: "Munich",  
    date: new Date(),
    duration: 36,
    latitude: 48.150676,
    longitude: 11.580984,
    isCurrent: false,
    isOpenForRegistration: false,
    allowNewSponsoring: false,
};

function Modal(props) {
    const event = useState(props.event || sampleEvent);

    return (
        <Dialog
            open={props.open}
            fullScreen={false}
            onClose={props.onClose}>
            <form onSubmit={deleteAccount}>
                <DialogTitle id="event-details">Event Details</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        label="Title"
                        fullWidth
                        value={event.title}
                        onChange={(change, title) => setEvent({...event, title})}
                    />
                    <TextField
                        autoFocus
                        label="City"
                        fullWidth
                        value={event.city}
                        onChange={(change, city) => setEvent({...event, city})}
                    />
                    <TextField
                        autoFocus
                        label="Title"
                        fullWidth
                        value={event.title}
                        onChange={(change, title) => setEvent({...event, title})}
                    />
                    <TextField
                        autoFocus
                        label="Title"
                        fullWidth
                        value={event.title}
                        onChange={(change, title) => setEvent({...event, title})}
                    />
                    <Switch 
                        label="Is Current"
                        checked={event.isCurrent} 
                        onChange={(change, checked) => setEvent({...event, isCurrent: checked})}
                    />
                    <Switch 
                        label="Is Open for Registration"
                        checked={event.isOpenForRegistration} 
                        onChange={(change, checked) => setEvent({...event, isOpenForRegistration: checked})}
                    />
                    <Switch 
                        label="Allows new sponsorings"
                        checked={event.allowNewSponsoring} 
                        onChange={(change, checked) => setEvent({...event, allowNewSponsoring: checked})}
                    />
                </DialogContent>
                <DialogActions style={{ justifyContent: 'flex-end' }}>
                    <Button onClick={props.onClose()} color="primary">
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

    const date = new Date(event.date * 1000);

    const toggle = (property) => {
        setEvent({...event, ...property})
    }

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
                <Switch disabled={!props.canEdit} checked={event.isCurrent} onChange={(event, checked) => toggle({isCurrent: checked})}/>
            </td>
            <td>
                <Switch disabled={!props.canEdit} checked={event.isOpenForRegistration} onChange={(event, checked) => toggle({isOpenForRegistration: checked})}/>
            </td>
            <td>
                <Switch disabled={!props.canEdit} checked={event.allowNewSponsoring} onChange={(event, checked) => toggle({allowNewSponsoring: checked})}/>
            </td>
            <td>
                <Button disabled={!props.canEdit} color="secondary" onClick={() => setIsDialogOpen(true)}>Edit</Button>
            </td>
        </tr>
    );
}