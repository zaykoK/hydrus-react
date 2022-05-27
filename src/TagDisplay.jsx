import React from 'react';
import TagButtonList from './TagButtonList';

function TagDisplay(props) {
  const tagDisplayStyle = {
    textAlign: 'center',
    display: 'flex',
    //justifyContent: 'center',
    gap: '3px',
    margin: '1px',
  }

  return <div style={tagDisplayStyle}>
    <TagButtonList removeTag={props.removeTag} tags={props.tags} />
  </div>;
}

export default TagDisplay