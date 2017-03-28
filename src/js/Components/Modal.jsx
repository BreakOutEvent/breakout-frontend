import React from 'react';
import ImportedModal from 'react-responsive-modal';
export default class Modal extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      show: this.props.show
    };
  }

  close() {
    this.props.onHide();
    this.setState({
      show: false
    });
  }

  render() {
    const overlayStyle = {
      zIndex: 10000,
      backgroundColor: 'rgba(0,0,0,0.5)'
    };

    const modalStyle = {
      marginTop: '150px',
      marginLeft: '10px',
      marginRight: '10px',
      borderRadius: '5px',
      padding: '40px',
      minWidth: '300px',
      paddingBottom: '10px'
    };

    return (
      <ImportedModal {...this.props}
                     open={this.state.show}
                     onClose={this.close.bind(this)}
                     overlayStyle={overlayStyle}
                     modalStyle={modalStyle}>
        {this.props.children}
      </ImportedModal>
    );
  }
}