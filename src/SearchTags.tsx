import React, { useState, useEffect } from 'react';
import TagDisplay from './TagDisplay';
import GroupButton from './GroupButton';

import './SearchTags.css'

interface SearchTagsProps {
  tags:Array<Array<string>>;
  addTag:Function;
  groupAction:Function;
  removeTag:Function;
}

export function SearchTags(props:SearchTagsProps) {
  const [tag, setTag] = useState('');

  const [tags, setTags] = useState(props.tags)

  function submitTag(event:React.FormEvent) {
    event.preventDefault(); //necessary to not reload page after submit
    console.log('submitTag')

    let split = tag.split(' OR ')
    if (split.length > 0) {
      let inside = []
      for (let i = 0; i < split.length; i++) {
        inside.push(split[i].toLowerCase())
      }
      props.addTag(inside)
    }
    else {
      props.addTag(tag);
    }
    setTag('');
  }

  //At some point should show autocomplete results
  async function searchTag(search:string) {
    setTag(search)
  }

  useEffect(() => {
    if (JSON.stringify(props.tags) !== JSON.stringify(tags)) {
      setTags(props.tags)
    }
  })

  function TagInput(props:{tags:Array<Array<string>>,removeTag:Function}) {

    return <div className="searchBar">
      <TagDisplay key={props.tags.toString()} removeTag={props.removeTag} tags={props.tags} />
      <form className="searchForm" onSubmit={submitTag}>
          <input
            className="searchInput"
            type="text"
            value={tag}
            placeholder="Search tags, -tag excludes, tag1 OR tag2 for alternative"
            onChange={(e) => searchTag(e.target.value)} />
      </form>
    </div>
  }

  return <div className='topBar'>
    <div style={{ width: '45px', height: 'inherit', flexShrink:'0' }} />
    <GroupButton clickAction={props.groupAction} />
    {TagInput({ removeTag: props.removeTag, tags: tags })}
  </div>;
}
