import React, { useEffect, useState } from 'react';
import AdminEventRow from './AdminEventRow.jsx';
import EditEventModal from './EditEventModal.jsx';

import {Button} from '@material-ui/core';

const sampleEvent = {
  title: 'Sample Event',
  city: 'Munich',
  brand: `BreakOut ${(new Date()).getFullYear()}`,
  teamFee: 60.0,
  date: (new Date()).getTime() / 1000,
  duration: 36,
  startingLocation: {
    latitude: 48.150676,
    longitude: 11.580984
  },
  isCurrent: false,
  isOpenForRegistration: false,
  allowNewSponsoring: false,
};

export default function AdminEventsOverview(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [canEdit, setCanEdit] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const init = () => {
    setIsLoading(true);
    props.api.getAllEvents().then(events => {
      setIsLoading(false);
      setEvents(events.reverse());
    });
    props.api.getMe().then(me => {
      setCanEdit(me.roles.indexOf('EVENT_OWNER') > -1);
    });
  };

  const addEvent = async (event) => {
    const newEvent = await props.api.createEvent(event);
    setEvents([newEvent, ...events]);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div> {isLoading && <h1>Loading...</h1>}{!isLoading &&
      <div>
        <div className="row">
          <div className="col-xs-12">
            <Button disabled={!canEdit} color="secondary" onClick={() => setIsDialogOpen(true)}>New Event</Button>
          </div>
        </div>
        <div style={{ display: 'flex' }}>
          <div className="row">
            <div className="col-xs-12">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>City</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Is Current</th>
                    <th>Is Open for Registration</th>
                    <th>Allows new Sponsorings</th>
                    <th>Edit</th>
                    <th>Participants</th>
                  </tr>
                </thead>
                <tbody id="list">
                  {events.map(event => <AdminEventRow key={event.id} api={props.api} canEdit={canEdit} event={event}/>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <EditEventModal open={isDialogOpen} event={sampleEvent} onChange={event => addEvent(event)} onClose={() => setIsDialogOpen(false)} />
      </div>
    }
    </div>
  );
}
