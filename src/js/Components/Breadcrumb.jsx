import React from 'react';
import {Link} from 'react-router-dom';

const Breadcrumbs = (props) => {
  return (
    <ul className="breadcrumb">
      {props.entries.map(entry => <BreadcrumbEntry key={entry.title} {...entry}/>)}
    </ul>
  );
};

Breadcrumbs.propTypes = {
  entries: React.PropTypes.array.isRequired
};

const BreadcrumbEntry = (props) => {
  if (props.isActive) {
    return <li className="active">{props.title}</li>;
  } else {
    return <li><Link to={props.link}>{props.title}</Link></li>;
  }
};

BreadcrumbEntry.propTypes = {
  isActive: React.PropTypes.bool,
  title: React.PropTypes.string.isRequired,
  link: React.PropTypes.string.isRequired
};

export default Breadcrumbs;