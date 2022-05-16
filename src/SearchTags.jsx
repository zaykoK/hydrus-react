import React, { useState } from 'react';
import * as API from './hydrus-backend.js';
import * as TagTools from './TagTools'


export function SearchTags(props) {
  const [tag, setTag] = useState('');
  const [searches, setSearches] = useState([]);

  const searchStyle = {
    textAlign: 'center',
    fontSize: 'larger',
    display:'flex',
    justifyContent: 'center',
    gap:'5px',

  }

  const searchBarStyle = {
    background: '#ffffff',
    boxShadow: '0 0 5px 0 black',
    height: '35px',
    minWidth: '40%',
    maxWidth: '80vw',
    border: 'none',
    borderRadius: '5px',
    textAlign: 'left',
    fontSize: '12px',
    flexGrow: '3'
  }

  function submitTag(event) {
    event.preventDefault(); //necessary to not reload page after submit

    let split = tag.split(' OR ')
    if (split.length > 0) {
      let inside = []
      for (let i = 0; i < split.length; i++) {
        inside.push(split[i].toLowerCase())
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

  function GroupButton(props){
    return <button style={{...TagTools.getTagButtonStyle(),height:'35px',fontSize:'auto',maxWidth:'15%'}} onClick={() => {props.clickAction()}}  >Group images</button>
  }
  


  function TagInput() {
    return <form onSubmit={submitTag} style={searchBarStyle}>
      <label style={{width:'fit-content'}}>
        <input style={{...searchBarStyle,width:'-webkit-fill-available'}}
          type="text"
          value={tag}
          placeholder="Search tags"
          onChange={(e) => searchTag(e.target.value)} />
      </label>
    </form>;
  }

  return <div style={searchStyle}><GroupButton clickAction={props.groupAction} />{TagInput()}</div>;
}
