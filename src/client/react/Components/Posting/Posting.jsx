import React from 'react';
import {Card, CardHeader, CardMedia, CardText} from 'material-ui/Card';
import Avatar from 'material-ui/Avatar';
import Divider from 'material-ui/Divider';
import {NavigationCheck, CommunicationComment, ActionThumbUp} from 'material-ui/svg-icons/index';
import {FlatButton} from 'material-ui';

export default class Posting extends React.Component {

  constructor(props) {
    super(props);
  }

  humanDate(date) {
    return new Date(date).toTimeString();
  }

  humanLocation(location) {
    if (location) {
      if (location.locationData) {
        return `${location.locationData.LOCALITY || ''}, ${location.locationData.COUNTRY || ''}`;
      } else {
        return `${location.latitude}, ${location.longitude}`;
      }
    } else {
      return '';
    }
  }

  buildSubtitle(firstname = '', date, location) {
    const humanDate = this.humanDate(date);
    const humanLocation = this.humanLocation(location);
    return `${firstname} um ${humanDate} in ${humanLocation}`;
  }

  render() {

    const profilePicUrl = this.props.user.profilePic.url;
    const teamName = this.props.user.participant.teamName;
    const subtitle = this.buildSubtitle(
      this.props.firstname,
      this.props.date,
      this.props.postingLocation
    );

    const media = this.props.media;
    const challengeDescription = this.props.proves.description;
    const postingText = this.props.text;
    const numberOfLikes = this.props.likes;
    const numberOfComments = this.props.comments.length;
    const comments = this.props.comments;

    return (
      <Card>
        <CardHeader
          avatar={profilePicUrl}
          title={teamName}
          subtitle={subtitle}
        />
        <PostingCardMedia
          type={media.type}
          url={media.url}
        />
        <CardText>
          {postingText}
        </CardText>
        <PostingProof
          description={challengeDescription}
        />
        <CommentsAndLikes
          likes={numberOfLikes}
          comments={numberOfComments}
        />
        <Comments
          comments={comments}
        />
      </Card>
    );
  }
}

const PostingProof = (props) => {
  if (props) {
    return <div><CardText style={{marginBottom: '15px'}}><ChallengeFulfilled
      description={props.description}/></CardText></div>;
  } else {
    return null;
  }
};

const PostingCardMedia = (props) => {
  if (props) {
    return <CardMedia><img src={props.url}/></CardMedia>;
  } else {
    return null;
  }
};

const CommentsAndLikes = (props) => {

  const iconStyle = {
    marginRight: '5px',
    height: '18px',
  };

  const style = {
    display: 'flex',
    alignItems: 'center',
    fontSize: 'small',
    paddingLeft: '16px',
    paddingTop: '8px',
    paddingBottom: '12px',
  };

  return (
    <div style={style}>
      <ActionThumbUp style={iconStyle}/>{props.likes} Likes
      <div style={{paddingRight: '15px'}}/>
      <CommunicationComment style={iconStyle}/> {props.comments.length} Kommentare
    </div>
  );
};

const ChallengeFulfilled = (props) => {

  const style = {
    border: '1px solid orange',
    paddingTop: '5px',
    paddingBottom: '5px',
    paddingLeft: '5px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center'
  };

  return (
    <div style={style}>
      <NavigationCheck style={{marginRight: '5px'}}/>
      {props.description}
    </div>
  );
};

const Comment = (props) => {

  const style = {
    fontSize: 'small',
    display: 'flex',
    alignItems: 'center',
    paddingTop: '10px',
    paddingBottom: '10px',
    backgroundColor: '#f3f3f3'
  };

  return (
    <div style={style}>
      <Avatar
        style={{width: '30px', height: '30px', marginLeft: '16px', marginRight: '10px'}}
        src={props.profilePic}/>
      <div>
        <div style={{fontWeight: 'bold'}}>{props.name}</div>
        <div>{props.text}</div>
      </div>
    </div>
  );
};

const Comments = (props) => {
  return (
    <div>
      {
        props.comments.map(comment => <span><Divider/><Comment
          name={comment.user.firstname + " " + comment.user.lastname}
          profilePic={comment.user.profilePic.url}
          text={comment.text}
        /></span>)
      }
      <Divider/>
      <div style={{
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f3f3f3',
        paddingLeft: '16px'
      }}>
        <textarea style={{
          padding: '5px',
          borderRadius: '10px',
          resize: 'none',
          border: '1px solid rgb(187, 187, 187)',
          flexGrow: 2
        }} type="text" name="comment" rows={1}/>
        <FlatButton label="Kommentieren" style={{marginLeft: '10px', marginRight: '10px'}}/>
      </div>
    </div>
  );
};