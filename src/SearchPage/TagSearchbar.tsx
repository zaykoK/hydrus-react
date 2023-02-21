import { useState, useEffect, useRef } from 'react';
import { isLandscapeMode, isMobile } from '../styleUtils';
import GroupButton from './GroupButton';
import IconInfo from '../assets/info.svg'
import IconGroup from '../assets/group.svg'
import IconHamburger from '../assets/menu-burger.svg'

import { getGroupingToggle } from '../StorageUtils';
import DropdownSorting from './SortingDropdown';

import './TagSearchbar.css'
import TagInput from './SearchBar';


//TODO Slide-in-out search bar in mobile mode with a search button or make it slide out when scrolling down start

interface SearchTagsProps {
  tags: Array<Array<string>>;
  groupAction: Function;
  infoAction: Function;
  sortTypeChange: Function;
  setNavigationExpanded: Function;
  type: string;
}

export function TagSearchBar(props: SearchTagsProps) {
  const [tags, setTags] = useState(props.tags)
  const [hidden, setHidden] = useState<boolean>(false)

  const scrollPosition = useRef(window.scrollY)

  function scrollHandler() {
    if (scrollPosition.current > window.scrollY && hidden === true) {
      setHidden(false)
    }
    if (scrollPosition.current < window.scrollY && hidden === false) {
      setHidden(true)
    }
    scrollPosition.current = window.scrollY
  }

  useEffect(() => {
    window.addEventListener('scroll', scrollHandler)

    return () => {
      window.removeEventListener('scroll', scrollHandler)
    }
  })

  useEffect(() => {
    if (JSON.stringify(props.tags) !== JSON.stringify(tags)) {
      setTags(props.tags)
    }
  }, [props.tags, tags])

  function getTopBarStyle(active: boolean) {
    let style = 'topBar'
    if (active) {
      style += ' hidden'
    }
    if (isMobile()) {
      style += " mobile"
      if (isLandscapeMode()) {
        style += " landscape"
      }
    }
    return style
  }

  //<div className='fullscreenWrapperTagList' />

  ///TODO
  ///Maybe some form of favourite tags visible when nothing else stands, or history of them

  return <div className={getTopBarStyle(hidden)}>
    <div className="buttonsBar">
      <GroupButton icon={IconHamburger} clickAction={() => { props.setNavigationExpanded(true) }} />
      <GroupButton icon={IconGroup} activeValue={getGroupingToggle()} clickAction={props.groupAction} />
      {/*<DropdownSorting clickFunction={props.sortTypeChange} options={API.enumToArray(API.FileSortType)} />*/}
      <GroupButton icon={IconInfo} clickAction={props.infoAction} />
    </div>
    <TagInput tags={tags} type={props.type} infoAction={props.infoAction} />
  </div>;
}
