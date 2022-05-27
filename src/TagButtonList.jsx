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
    if (props.tags == undefined) {return}
    let map = TagTools.tagArrayToMap(props.tags)
    let sortedTags = TagTools.transformIntoTuple(map)
    let tagSet = [];
    for (let t in sortedTags) {
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