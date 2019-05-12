import React from 'react';

const queryItems = {
    purposeOfTransferCode: {
        name: 'Code in Purpose of Transfer',
        placeholder: 'e.g. 6B496A',
        type: 'TEXT'
    },
    teamId: {
        name: 'Team ID',
        placeholder: '0',
        type: 'TEXT'
    },
    eventId: {
        name: 'Event',
        type: 'DROPDOWN',
        options: (props) => props.events,
        names: (event) => event.title,
        values: (event) => event.id
    },
    firstname: {
        name: 'First Name',
        placeholder: 'Max',
        type: 'TEXT'
    },
    lastname: {
        name: 'Last Name',
        placeholder: 'Mustermann',
        type: 'TEXT'
    },
    minDonation: {
        name: 'Minimum Donation Promise',
        placeholder: '20',
        type: 'TEXT'
    },
    maxDonation: {
        name: 'Maximum Donation Promise',
        placeholder: '100',
        type: 'TEXT'
    },
    donorType: {
        name: 'Donor Type',
        type: 'DROPDOWN',
        options: () => ['DONOR', 'ACTIVE', 'PASSIVE'],
        names: (option) => option,
        values: (option) => option 
    }
}

export default class InvoiceFilterSearchForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            availableFilters: Object.keys(queryItems),
            query: [],
            events: []
        };
    }

    componentDidMount() {
      this.props.api.getAllEvents()
        .then(events => this.setState({events: events}))
        .catch(err => this.setState({error: err}));
    }

    urlQuery() {
        var query = {};
        for (let index = 0; index < this.state.query.length; index++) {
            if (this.state.query[index].value !== null) {
                query[this.state.query[index].identifier] = this.state.query[index].value;
            }
        }
        return query;
    }

    onValueChange(index, value) {
        let query = [...this.state.query];
        query[index].value = value;
        this.setState({ query });
    }

    onNewQuery(change) {
        let identifier = change.target.value;
        let availableFilters = this.state.availableFilters.filter((x) => x !== identifier);
        let query = [
            ...this.state.query,
            { identifier, value: queryItems[identifier].defaultValue || null }
        ];

        change.target.value = undefined;

        this.setState({ query, availableFilters });
    }

    onReset() {
        this.setState({ query: [], availableFilters: Object.keys(queryItems) });
    }

    onSearch(event) {
        event.preventDefault();
        this.props.onSearch(this.urlQuery());
    }

    render() {
        let button;
        if (this.props.isLoading) {
            button = (<button className="btn btn-primary">
                <div className="spinner">
                  <div className="bounce1" style={{backgroundColor: 'white'}}></div>
                  <div className="bounce2" style={{backgroundColor: 'white'}}></div>
                  <div className="bounce3" style={{backgroundColor: 'white'}}></div>
                </div>
              </button >)
        } else {
            button = (<input 
                type="submit" 
                value="Search"
                id='register-btn'
                className="btn btn-primary"/>);
        }

        return (
            <form onSubmit={this.onSearch.bind(this)}>
                <div className="panel panel-default" style={{width: 500}}>
                    {this.state.query.map((filter, index) => <CurrentFilter key={index} index={index} filter={filter} onChange={this.onValueChange.bind(this)} events={this.state.events}/>)}
                    <div className="panel-heading" style={{display: 'flex'}}>
                        <h5 style={{marginRight: 20}}>Add a Filter:</h5>
                        <select className="selectpicker" value={undefined} onChange={this.onNewQuery.bind(this)}>
                            <option value="" disabled selected>--Select one--</option>
                            {Object.keys(queryItems).map((identifier) => <option key={identifier} value={identifier} disabled={this.state.availableFilters.indexOf(identifier) < 0}>{queryItems[identifier].name}</option>)}
                        </select>
                    </div>
                    <div className="panel-heading" style={{display: 'flex'}}>{button}</div>
                    {this.state.query.length > 0 && 
                        <div className="panel-heading" style={{ display: 'flex', justifyContent: 'flex-end'}}>
                            <a onClick={this.onReset.bind(this)}>
                                Reset Filters
                            </a>
                        </div>
                    }
                </div>
            </form>
        );
    }
}

class CurrentFilter extends React.Component {

    componentDidMount() {
        $(`.selectpicker`).selectpicker('refresh');
    }

    render() {
        let query = queryItems[this.props.filter.identifier]
        let name = (<h5 style={{marginRight: 20}}>{query.name}:</h5>);
        let input;

        switch (query.type) {
        case 'TEXT':
            input = (
                <input type="text"
                    className="form-control"
                    placeholder={query.placeholder}
                    style={{borderRadius: '20px', border: '1px solid rgba(180,180,180)'}}
                    onChange={(change) => this.props.onChange(this.props.index, change.target.value)}/>
            );
            break;
        case 'DROPDOWN':
            input = (
                <select defaultValue={null} value={undefined}
                    className="selectpicker" 
                    style={{height: 40, width: 250}}
                    defaultValue={query.placeholder} 
                    onChange={(change) => this.props.onChange(this.props.index, change.target.value)}>
                    <option value="" disabled selected>--Select one--</option>
                    {query.options(this.props).map(option => <option key={query.values(option)} value={query.values(option)}>{query.names(option)}</option>)}
                </select>
            );
            break;
        default:
            break;
        }

        return (
            <div className="panel-heading" style={{display: 'flex'}}>
                {name}
                {input}
            </div>
        )
    }
}