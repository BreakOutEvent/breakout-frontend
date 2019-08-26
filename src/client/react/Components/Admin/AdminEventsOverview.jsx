import React, { useEffect, useState } from 'react';
import AdminEventRow from './AdminEventRow.jsx';

export default function AdminEventsOverview(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [canEdit, setCanEdit] = useState(false);

  const init = () => {
    setIsLoading(true);
    props.api.getAllEvents().then(events => {
      setIsLoading(false);
      setEvents(events.reverse());
    });
    props.api.getMe().then(me => {
      setCanEdit(me.roles.indexOf('EVENT_OWNER') > -1);
    })
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div> {isLoading && <h1>Loading...</h1>}{!isLoading &&
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
                </tr>
              </thead>
              <tbody id="list">
                {events.map(event => <AdminEventRow key={event.id} api={props.api} canEdit={canEdit} event={event}/>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }
    </div>
  );
}
