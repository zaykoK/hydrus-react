import React from 'react';
import TagButtonList from './TagButtonList';

interface TagDisplayProps {
  tags:Array<Array<string>>;
  removeTag:Function;
}

function TagDisplay(props:TagDisplayProps) {
  const tagDisplayStyle:React.CSSProperties = {
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