import React from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';

const Breadcrumbs = (props) => {
  return (
    <ul className="breadcrumb">
      {props.entries.map(entry => <BreadcrumbEntry key={entry.title} {...entry}/>)}
    </ul>
  );
};

Breadcrumbs.propTypes = {
  entries: PropTypes.array.isRequired
};

const BreadcrumbEntry = (props) => {
  if (props.isActive) {
    return <li className="active">{props.title}</li>;
  } else {
    return <li><Link to={props.link}>{props.title}</Link></li>;
  }
};

BreadcrumbEntry.propTypes = {
  isActive: PropTypes.bool,
  title: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired
};

export default Breadcrumbs;