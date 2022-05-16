import React, { useState, useEffect } from 'react';
import * as TagTools from './TagTools'

function TagButtonList(props) {
  const [tagList, setTagList] = useState([]);

  function tagTupleToString(tag) {
    if (Array.isArray(tag)) {
      let result = ''
      for (let i = 0; i < tag.length; i++) {
        result += tag[i] + ' OR '
      }
      result = result.slice(0, -4) //Remove last ' OR ' from string
      return result
    }
    return tag
  }

  useEffect(() => {
    let sortedTags = TagTools.transformIntoTuple(props.tags)
    let tagSet = [];
    for (let t in props.tags) {
      tagSet.push(<button
        key={props.tags[t]}
        style={TagTools.getTagButtonStyle(sortedTags[t].namespace)}
        onClick={() => { props.removeTag(props.tags[t]); }}>
        {tagTupleToString(props.tags[t])}</button>);
    }
    setTagList(tagSet);
  }, []);

  return <>{tagList}</>;
}
export default TagButtonList