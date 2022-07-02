import React from 'react';
import TagButtonList from './TagButtonList';
import "./TagDisplay.css"

interface TagDisplayProps {
  tags:Array<Array<string>>;
  removeTag:Function;
}

function TagDisplay(props:TagDisplayProps) {
  return <div className="tagDisplayStyle">
    <TagButtonList removeTag={props.removeTag} tags={props.tags} />
  </div>;
}

export default TagDisplay