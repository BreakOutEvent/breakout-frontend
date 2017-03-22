import React from 'react';

const LoadingIndicator = (props) => {

  const style = {
    backgroundColor: props.color || 'white'
  };

  return (
    <div className="spinner spinner-small">
      <div className="bounce1" style={style}>
      </div>
      <div className="bounce2" style={style}>
      </div>
      <div className="bounce3" style={style}>
      </div>
    </div>
  );
};

const FullWidthButton = (props) => {
  return (
    <div className="row">
      <div className="col-lg-12">
        <ButtonBig style={props.style} onClick={props.onClick} loading={props.loading}>
          {props.children}
        </ButtonBig>
      </div>
    </div>
  );
};

const CenterButton = (props) => {
  const style = {
    display: 'flex',
    justifyContent: 'center',
    width: '100%'
  };

  return <span style={style}>{ButtonBig(props)}</span>;
};

const ButtonBig = (props) => {

  const transparent = {
    backgroundColor: 'transparent',
    color: '#BDBDBD',
    fontSize: 'small',
    border: 'none',
    marginTop: '-8px'
  };

  const defaultStyle = {
    marginBottom: '10px',
    height: '44px',
    borderRadius: '50px',
    backgroundColor: 'transparent',
    color: '#e6823c',
    borderWidth: '2px',
    textTransform: 'uppercase'
  };

  const primary = {
    height: '44px',
    borderRadius: '50px',
    textTransform: 'uppercase',
    color: 'white'
  };


  let style;
  if (!props.style) {
    style = defaultStyle;
  } else if (props.style === 'primary') {
    style = primary;
  } else if (props.style === 'default') {
    style = defaultStyle;
  } else if (props.style === 'transparent') {
    style = transparent;
  } else {
    style = defaultStyle;
  }

  return (
    <button className="btn btn-primary"
            style={style}
            onClick={props.onClick}>
      {props.loading &&
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <LoadingIndicator color={style.color}/>
      </div>
      }
      { !props.loading &&
      props.children
      }
    </button>
  );
};

export {FullWidthButton, ButtonBig, CenterButton}