import React, {Component}from "react";
import axios from "axios";
import { CSVLink } from "react-csv";

export default class DownloadUserCSVButton extends React.Component {
  constructor(props) {
      super(props);

      this.state = {
        listOfUsers: [],
        loading: false
      };
  }

    getUsers(done) {
    if(!this.state.loading) {
      this.setState({
        loading: true
      });
      axios.get("http://localhost:8082/user/").then((userListJson) => {
        this.setState({
          listOfUsers: userListJson,
          loading: false
        });
        done(true); // Proceed and get data from dataFromListOfUsersState function
      }).catch(() => {
        this.setState({
          loading: false
        });
        done(false);
      });
    }
  }

  dataFromListOfUsersState () {
    return this.state.listOfUsers;
  }

  render() {
    const {loading} = this.state;
    return <CSVLink
      data={this.dataFromListOfUsersState}
      asyncOnClick={true}
      onClick={this.getUsers}
    >
      {loading ? 'Loading csv...' : 'Download me'}
    </CSVLink>;
  }
}
console.log('click2');