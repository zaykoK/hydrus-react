import React, { useState, useEffect } from 'react';
import { isLandscapeMode, isMobile } from '../styleUtils';
import TagDisplay from '../TagDisplay';
import GroupButton from './GroupButton';

import './TagSearchbar.css'

interface SearchTagsProps {
  tags: Array<Array<string>>;
  addTag: Function;
  groupAction: Function;
  removeTag: Function;
}

export function TagSearchBar(props: SearchTagsProps) {
  const [tag, setTag] = useState('');

  const [tags, setTags] = useState(props.tags)

  function submitTag(event: React.FormEvent) {
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
  async function searchTag(search: string) {
    setTag(search)
  }

  useEffect(() => {
    if (JSON.stringify(props.tags) !== JSON.stringify(tags)) {
      setTags(props.tags)
    }
  })

  function TagInput(props: { tags: Array<Array<string>>, removeTag: Function }) {

    function getSearchBarStyle() {
      if (isMobile()) {return "searchBar mobile"}
      return "searchBar"
    }

    return <div className={getSearchBarStyle()}>
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

  function getTopBarStyle() {
    if (isMobile()) {
      if (isLandscapeMode()) { return "topBar mobile landscape" }
      return "topBar mobile"
    }
    return "topBar"
  }

  return <div className={getTopBarStyle()}>
    <div className="buttonsBar">
      <div className="topBarButton" />
      <GroupButton clickAction={props.groupAction} />
    </div>
    {TagInput({ removeTag: props.removeTag, tags: tags })}
  </div>;
}
