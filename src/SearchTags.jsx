import React, { useState } from 'react';
import * as API from './hydrus-backend.js';


export function SearchTags(props) {
  const [tag, setTag] = useState('');
  const [searches, setSearches] = useState([]);

  const searchStyle = {
    textAlign: 'center',
    fontSize: 'larger'
  }

  const searchBarStyle = {
    background: '#ffffff',
    boxShadow: '0 0 0 0 grey',
    height: '35px',
    minWidth: '40%',
    maxWidth: '90vw',
    border: 'none',
    borderRadius: '5px',
    textAlign: 'center',
    fontSize: 'larger'
  }

  function submitTag(event) {
    event.preventDefault(); //necessary to not reload page after submit

    let split = tag.split(' OR ')
    console.log(split)
    if (split.length > 1) {
      let inside = []
      for (let i = 0; i < split.length; i++) {
        inside.push(split[i])
      }
      props.addTag(inside)
    }
    else{
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


  function TagInput() {
    return <form onSubmit={submitTag}>
      <label>
        <input style={searchBarStyle}
          type="text"
          value={tag}
          placeholder="Search tags"
          onChange={(e) => searchTag(e.target.value)} />
      </label>
    </form>;
  }

  return <div style={searchStyle}>{TagInput()}</div>;
}
