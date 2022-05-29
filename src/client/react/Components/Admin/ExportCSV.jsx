import React from "react";
import axios from "axios";
import { CSVLink } from "react-csv";


async function CSVDownload() {
    try {
      const dbData = await axios.get("http://localhost:8082/user/")
      console.log(dbData.data);
    } catch (error) {
      console.error(error);
    }
  }

export default CSVDownload