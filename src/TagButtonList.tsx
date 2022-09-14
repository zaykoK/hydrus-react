import * as React from 'react';
import * as TagTools from './TagTools'

import './TagButton.css'


import { removeTag } from './SearchPage/SearchPageHelpers'
import { NavigateFunction } from 'react-router-dom';


interface TagButtonListProps {
  tags: Array<Array<string>>;
  navigate?: NavigateFunction;
  removeTag?: Function;
}

function TagButtonList(props: TagButtonListProps) {
  const [tagList, setTagList] = React.useState<Array<JSX.Element>>([]);

  /** Converts an array of tags into single string.
   * 
   * ['tag1,'tag2'] => 'tag1 OR tag2'
   * 
   * ['tag'] => 'tag'
   * @param {Array<string>} tag - Array of strings
   */
  function tagArrayToString(tag: Array<string>): string {
    let result = ''

    let tagLength = tag.length

    for (let i = 0; i < tagLength; i++) {
      result += tag[i] + ' OR '
    }
    result = result.slice(0, -4) //Remove last ' OR ' from string
    return result
  }

  function determineFunction(parameter: Array<string>) {
    if (props.removeTag !== undefined) {
      props.removeTag(parameter)
      return
    }
    if (props.navigate !== undefined) {
      removeTag(parameter, props.navigate, 'image')
      return
    }
  }


  React.useEffect(() => {
    //There's nothing to do if no tags exist
    if (props.tags === undefined || props.tags.length === 0 || (props.tags.length === 1 && props.tags[0].length === 0)) { return }
    let sortedTags: Array<TagTools.Tuple> = []

    for (let tagArray of props.tags) {
      //Take first member of array and split it by ':'
      let temp = tagArray[0].split(':')
      if (temp.length > 1) {
        sortedTags.push({ namespace: temp[0], value: temp[1], count: 1 })
      }
      else {
        sortedTags.push({ namespace: '', value: temp[0], count: 1 })
      }

    }
    let tagSet = [];
    for (let t in props.tags) {
      tagSet.push(<button
        className='tagButton'
        key={props.tags[t].toString()}
        style={TagTools.getTagButtonStyle(sortedTags[t].namespace)}
        onClick={() => { determineFunction(props.tags[t]) }}>
        {tagArrayToString(props.tags[t])}</button>);
    }
    setTagList(tagSet);
  }, []);

  return <>{tagList}</>;
}
export default TagButtonList