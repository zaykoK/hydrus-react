import React from 'react';
import TagButtonList from './TagButtonList';

function TagDisplay(props) {
  const tagDisplayStyle = {
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    gap: '5px',
    margin: '8px',
  }

  return <div style={tagDisplayStyle}>
    <TagButtonList removeTag={props.removeTag} tags={props.tags} />
  </div>;
}

export default TagDisplay