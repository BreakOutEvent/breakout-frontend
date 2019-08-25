import React, {useEffect, useState} from 'react';

function EventRow(props) {
  return (<tr>
    <td>
      {props.event.id}
    </td>
    <td>
      {props.event.city}
    </td>
  </tr>);
}

export default function AdminEventsOverview(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState([]);

  const init = () => {
    setIsLoading(true);
    props.api.getAllEvents().then(events => {
      setIsLoading(false);
      setEvents(events);
    });
  };

  useEffect(() => {
    init();
  }, []);

  return (<div> {isLoading && <h1>Loading...</h1>}{!isLoading &&
  <div style={{display: 'flex'}}>
    <div className="row">
      <div className="col-xs-12">
        <table className="table table-striped">
          <thead>
          <tr>
            <th>id</th>
            <th>City</th>
          </tr>
          </thead>
          <tbody id="list">
          {events.map((event) => <EventRow key={event.id} api={props.api} event={event}/>)}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  }
  </div>);
}
