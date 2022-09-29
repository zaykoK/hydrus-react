import React, { useState, useEffect, useRef } from 'react';
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

import * as TagTools from '../TagTools'
import { TagList } from '../TagList';

//TODO Slide-in-out search bar in mobile mode with a search button or make it slide out when scrolling down start

interface SearchTagsProps {
  tags: Array<Array<string>>;
  groupAction: Function;
  infoAction: Function;
  sortTypeChange: Function;
  setNavigationExpanded: Function;
  type:string;
}

type TagLookupResult = {
  value:string;
  count:number;
}

const blacklist = JSON.parse(localStorage.getItem('blacklisted-namespaces') || '[]' )

function TagLookupResultToTuple(tags:Array<TagLookupResult>):Array<TagTools.Tuple> {
  let filteredTags:Array<TagTools.Tuple> = []
  for (let tag of tags) {
    let splitted = tag.value.split(':',2)
    if (splitted.length > 1) {
      if (!blacklist.includes(splitted[0])) {
        filteredTags.push({
          namespace: splitted[0],
          value: splitted[1],
          count: tag.count
        })
      }
    }
    else {
      filteredTags.push({
        namespace: '',
        value: splitted[0],
        count: tag.count
      })
    }
  }
  return filteredTags
}

export function TagSearchBar(props: SearchTagsProps) {
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState(props.tags)

  const [helpTags,setHelpTags] = useState<Array<TagTools.Tuple>>([])
  const [helpTagsVisible,setHelpTagsVisible] = useState<boolean>(false)

  const navigate = useNavigate()

  const abortController = useRef<AbortController|undefined>()

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
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController()

    //Don't search anything if less than 3 letters are written, this really improves performance as you don't wait for potentially dozens of thousands of results, that just 1 or 2 letters will give, this does create a bit of an issue for two or less letter words like "pi" or "character:l" (from death note)
    //Also clear search if less than 3 letters are typed in
    if (search.length < 2 && JSON.stringify(helpTags) !== JSON.stringify([])) {setHelpTags([])}
    if (search.length > 1) {
      let response = await API.api_add_tags_search_tags({
        search: search,
        abortController:abortController.current
      }).catch((reason) => {return})
      /// Process the results
      if (response) {
        let tags:Array<TagLookupResult> = response.data.tags
        let filteredTags:Array<TagTools.Tuple> = TagLookupResultToTuple(tags)
        setHelpTags(filteredTags)
      }
    }

  }

  useEffect(() => {
    if (JSON.stringify(props.tags) !== JSON.stringify(tags)) {
      setTags(props.tags)
    }
  }, [props.tags, tags])

  function TagInput(props: { tags: Array<Array<string>>, type:string, infoAction:Function }) {

    function getSearchBarStyle() {
      if (isMobile()) { return "searchBar mobile" }
      return "searchBar"
    }

    return <div className={getSearchBarStyle()}>
      <TagDisplay key={props.tags.toString()} tags={props.tags} navigate={navigate} type={props.type}/>
      <form className="searchForm" onSubmit={submitTag}>
        <input
          onFocus={() => {setHelpTagsVisible(true); props.infoAction(false)}}
          onBlur={() => setTimeout(() => {setHelpTagsVisible(false);setTag('');setHelpTags([])},100)}
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

  function getHelpTagsListStyle(visible:boolean) {
    let style = 'HelpTagsListOverlay'
    if (visible) {style += ' visible'}
    if (isMobile()) {style += ' mobile'}
    return style
  }

  //<div className='fullscreenWrapperTagList' />

  ///TODO
  ///Maybe some form of favourite tags visible when nothing else stands, or history of them

  return <div className={getTopBarStyle()}>
    <div className="buttonsBar">
      <GroupButton icon={IconHamburger} clickAction={() => { props.setNavigationExpanded(true) }} />
      <GroupButton icon={IconGroup} activeValue={getGroupingToggle()}  clickAction={props.groupAction} />
      {/*<DropdownSorting clickFunction={props.sortTypeChange} options={API.enumToArray(API.FileSortType)} />*/}
      {(isMobile()) && <GroupButton icon={IconInfo} clickAction={props.infoAction} />}
    </div>
    {TagInput({ tags: tags, type:props.type, infoAction:props.infoAction })}
    <div className={getHelpTagsListStyle(helpTagsVisible)}>
      <TagList tags={helpTags} visibleCount={true} type={'image'} searchBar={true} />
      {(helpTags.length > 0) ? <p className='helpTagsDisclaimer'>
        <span>All results are "raw" tags, this is a limitation of hydrus.</span>
      </p>:<></>}
    </div>
  </div>;
}
