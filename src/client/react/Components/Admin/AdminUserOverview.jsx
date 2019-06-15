import React, {useEffect, useState} from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, {selectFilter, textFilter} from 'react-bootstrap-table2-filter';
import AdminUserRow from './AdminUserRow.jsx'

function useDebouncedValue(value, delayMS) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delayMS);
    return () => clearTimeout(handler);
  }, [value, delayMS]);

  return debouncedValue;
}

export default function AdminUserOverview(props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  const debouncedQuery = useDebouncedValue(query, 300);

  const search = () => {
    if (debouncedQuery.length < 3) {
      setIsLoading(false);
      setResults([]);
      return;
    }

    setIsLoading(true);
    props.api.searchUser(debouncedQuery).then((results) => {
      setIsLoading(false);
      setResults(results);
    }).catch(() => {
      setIsLoading(false);
      setResults([]);
    });
  };

  useEffect(() => {
    search();
  }, [debouncedQuery]);

  return (
    <div>
      <div className="panel-heading" style={{ display: 'flex' }}>
        <input type="text"
          className="form-control"
          placeholder={query.placeholder}
          style={{ borderRadius: '20px', border: '1px solid rgba(180,180,180)' }}
          onChange={(change) => setQuery(change.target.value)}/>
      </div>
      {isLoading &&
        <h1>Loading...</h1>
      }
      {!isLoading &&
        <div style={{display: 'flex'}}>
          <div className="row">
              <div className="col-xs-12">
                  <table className="table table-striped">
                      <thead>
                      <tr>
                          <th>Firstname</th>
                          <th>Lastname</th>
                          <th>Email</th>
                          <th>Aktion</th>
                      </tr>
                      </thead>
                      <tbody id="list">
                        {results.map((user) => <AdminUserRow key={user.id} api={props.api} user={user} onChange={search}/>)}
                      </tbody>
                  </table>
              </div>
          </div>
        </div>
      }
    </div>
  );
}
