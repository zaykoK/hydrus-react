import React, { useState, useEffect } from 'react';
import * as API from './hydrus-backend.js';
import * as TagTools from './TagTools'
import TagDisplay from './TagDisplay.jsx';

import GroupButton from './GroupButton.jsx';


export function SearchTags(props) {
  const [tag, setTag] = useState('');
  const [searches, setSearches] = useState([]);

  const [tags, setTags] = useState(props.tags)

  const topBarStyle = {
    textAlign: 'center',
    fontSize: 'larger',
    display: 'flex',
    justifyContent: 'center',
    gap: '5px',
    height: '43px',
    margin: '0px 3px 3px 3px',
    background: '#333333',
    padding: '3px',
    boxShadow: '0 0 5px 0 black',
  }

  const searchBarSt = {
    background: '#ffffff',
    boxShadow: '0 0 5px 0 black',
    display: 'flex',
    flexFlow: 'rows',
    height: 'inherit',
    margin: '0px',
    minWidth: '40%',
    maxWidth: '95vw',
    borderRadius: '5px',
    overflow: 'hidden'

  }

  const formStyle = {
    height: 'inherit',
    flexGrow: '1',
    borderRadius: '5px'
  }

  const labelStyle = {
    display: 'block',
    height: 'inherit',
    width: 'inherit'
  }

  const inputStyle = {
    display: 'block',
    height: 'inherit',
    width: '99%',
    border: 'none',
    borderRadius: '5px',
    textAlign: 'left',
    fontSize: '12px',
    padding: '0px 0px 0px 3px',
    margin: '0px',
  }

  function submitTag(event) {
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
  async function searchTag(search) {
    setTag(search)

    //let response = await API.api_add_tags_search_tags({search:search});
    //let result = response.data.tags;
    //console.log(result)
    //setSearches(result);

  }



  

  useEffect(() => {
    if (JSON.stringify(props.tags) !== JSON.stringify(tags)) {
      setTags(props.tags)
    }
  })

  function TagInput(props) {
    return <div style={searchBarSt}>
      <TagDisplay key={props.tags} removeTag={props.removeTag} tags={props.tags} />
      <form onSubmit={submitTag} style={formStyle}>
        <label style={labelStyle}>
          <input style={inputStyle}
            type="text"
            value={tag}
            placeholder="Search tags, -tag excludes, tag1 OR tag2 for alternative"
            onChange={(e) => searchTag(e.target.value)} />
        </label>
      </form>
    </div>
  }

  return <div style={topBarStyle}>
    <div style={{ width: '125px', height: 'inherit' }} />
    <GroupButton clickAction={props.groupAction} />
    {TagInput({ removeTag: props.removeTag, tags: tags })}
  </div>;
}
