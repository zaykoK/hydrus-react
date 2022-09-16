import React, { useState, useEffect } from 'react';
import { isLandscapeMode, isMobile } from '../styleUtils';
import TagDisplay from '../TagDisplay';
import GroupButton from './GroupButton';
import IconInfo from '../assets/info.svg'
import IconGroup from '../assets/group.svg'
import IconHamburger from '../assets/menu-burger.svg'

import { getGroupingToggle } from '../StorageUtils';

import DropdownSorting from './SortingDropdown';
import * as API from '../hydrus-backend'

import './TagSearchbar.css'

import { addTag } from './SearchPageHelpers'
import { useNavigate } from 'react-router-dom';

//TODO Slide-in-out search bar in mobile mode with a search button or make it slide out when scrolling down start

interface SearchTagsProps {
  tags: Array<Array<string>>;
  groupAction: Function;
  infoAction: Function;
  sortTypeChange: Function;
  setNavigationExpanded: Function;
  type:string;
}

export function TagSearchBar(props: SearchTagsProps) {
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState(props.tags)

  const navigate = useNavigate()


  function submitTag(event: React.FormEvent) {
    event.preventDefault(); //necessary to not reload page after submit

    let split = tag.split(' OR ')
    let splitLength = split.length

    //This is technically buggy, as the intent was to sent queries that don't do OR as string but it actually works really nice

    if (splitLength > 0) {
      let inside = []
      for (let i = 0; i < splitLength; i++) {
        inside.push(split[i].toLowerCase())
      }
      addTag(inside, navigate, props.type)
    }
    else {
      console.log('do i go here ever?')
      addTag(tag, navigate, props.type)
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
  }, [props.tags, tags])

  function TagInput(props: { tags: Array<Array<string>>, type:string }) {

    function getSearchBarStyle() {
      if (isMobile()) { return "searchBar mobile" }
      return "searchBar"
    }

    return <div className={getSearchBarStyle()}>
      <TagDisplay key={props.tags.toString()} tags={props.tags} navigate={navigate} type={props.type}/>
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
      <GroupButton icon={IconHamburger} clickAction={() => { props.setNavigationExpanded(true) }} />
      <GroupButton icon={IconGroup} activeValue={getGroupingToggle()}  clickAction={props.groupAction} />
      {/*<DropdownSorting clickFunction={props.sortTypeChange} options={API.enumToArray(API.FileSortType)} />*/}
      {(isMobile()) && <GroupButton icon={IconInfo} clickAction={props.infoAction} />}
    </div>
    {TagInput({ tags: tags, type:props.type })}
  </div>;
}
