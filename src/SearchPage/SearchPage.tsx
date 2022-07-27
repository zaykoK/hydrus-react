import React, { useEffect, useRef, useState } from 'react';
import { ImageWall } from "./ImageWall";
import { TagSearchBar } from "./TagSearchbar";
import { useParams, useNavigate } from 'react-router-dom';
import * as API from '../hydrus-backend';
import * as TagTools from '../TagTools';
import { TagList } from '../TagList';

import { getBlacklistedNamespaces, getComicNamespace, getGroupingToggle, getGroupNamespace } from '../StorageUtils';
import { tagArrayToNestedArray } from '../TagTools';
import { setPageTitle } from '../misc';

import './SearchPage.css'
import { isLandscapeMode, isMobile } from '../styleUtils';

interface SearchPageProps {
  type: string;
  globalState: any;
}

type ParamsType = {
  tags: Array<Array<string>>;
  page: number;
}

export function SearchPage(props: SearchPageProps) {
  //Current search tags
  const [tags, setTags] = useState<Array<Array<string>>>()
  //Result of search for current search tags
  const [hashes, setHashes] = useState<Array<string>>([])
  //Unfiltered result of search for current search tags
  const [ungroupedHashes, setUngroupedHashes] = useState([])
  //Current search parameters, tags(unused?) and current page of search results
  const [params, setParams] = useState<ParamsType>({ tags: [[]], page: 0 })
  //List of unique tags for given files
  const [fileTags, setFileTags] = useState<Array<TagTools.Tuple>>([])
  //Whether or not search results should be grouped
  const [groupFiles, setGroupFiles] = useState<boolean>(getGroupingToggle())
  //Map of grouped files count for each of the results
  const [groupCount, setGroupCount] = useState<Map<any, any>>(new Map())
  //Field that accesses "actual" current URL parameters
  const { parm } = useParams<string>()
  //Whether page has finished loading or not (doesn't work that well now)
  const [loaded, setLoaded] = useState<boolean>(false)
  //Whether panel with tag info should show up (right now only mobile mode has this)
  const [sideBarVisible, setSideBarVisible] = useState<boolean>(false)

  //Results of previous search, used to check if on a new rerender a search changed
  const previousSearch = useRef<Array<Array<string>>>()
  //Sorting order for grabbing files from hydrus API
  const sortType = useRef<API.FileSortType>(API.FileSortType.ImportTime)

  const navigate = useNavigate()

  //console.log(props.globalState?.getGlobalValue())
  //props.globalState?.setGlobalValue('search')

  function refreshParams(): void {
    let [paramsTags, paramsPage] = readParams(parm)

    setPageTitle(paramsTags, parseInt(paramsPage), props.type)
    setParams({ tags: paramsTags, page: parseInt(paramsPage) })
    setTags(paramsTags)
  }

  function changeGrouping() {
    localStorage.setItem('group-toggle', (!groupFiles).toString())
    setGroupFiles(!groupFiles)
  }



  function groupImages(responses: Array<API.MetadataResponse>, hashes: Array<string>, groupNamespace: string = 'group-title') {
    //TODO
    //Sort tags in groups according to page(or some other) order
    //Add option to use oldest file in group as representant
    let groupMap = new Map()
    let countMap = new Map()
    let hashesCopy = hashes.slice()

    

    for (let element of responses) {
      //TODO move tag grabbing (response.service_to_...[etc]) into own function to make code easier to read

      //Grab key for 'all known tags' service from session storage, if properly grabbed API key then should work
      let allKnownTagsKey = sessionStorage.getItem('hydrus-all-known-tags');
      if (!allKnownTagsKey) { allKnownTagsKey = '';console.error('Could not grab "all known tags" key from sessionStorage, this is bad.') }
      let serviceKeys = element.service_keys_to_statuses_to_display_tags[allKnownTagsKey]
      if (serviceKeys) {
        let filter = TagTools.tagArrayToMap(serviceKeys[API.ServiceStatusNumber.Current] || [])
        let filterTags = TagTools.transformIntoTuple(filter).filter((element) => element["namespace"] === groupNamespace)

        let pageTags = TagTools.transformIntoTuple(filter).filter((element) => element["namespace"] === 'page')

        if (filterTags.length !== 0) { //Don't create group for files with no group namespace
          let temp = groupMap.get(filterTags[0].value)
          if (temp != undefined) {
            //Remove every next image belonging to the group
            hashesCopy.splice(hashesCopy.indexOf(element.hash), 1)
            countMap.set(temp.hashes[0], countMap.get(temp.hashes[0]) + 1)
            groupMap.set(filterTags[0].value,
              {
                hashes: [...temp.hashes, element.hash],
                pageTags: [...temp.pageTags, pageTags],
                timeModified: [...temp.timeModified, element.time_modified]
              })
          }
          else {
            groupMap.set(filterTags[0].value,
              {
                hashes: [element.hash],
                pageTags: [pageTags],
                timeModified: [element.time_modified]
              })
            countMap.set(element.hash, 1)
          }
        }
      }
    }
    setGroupCount(countMap)
    return hashesCopy
  }

  async function Search() {
    //If there is nothing to search for or search is identical to previous don't do anything
    if (tags === undefined) {
      //console.log('not doing anything undefined');
      return
    }
    if (JSON.stringify(tags) === JSON.stringify(previousSearch.current)) {
      //console.log("not doing anything same search")
      return
    }

    previousSearch.current = tags.slice()
    let searchTags = tags.slice()
    if (searchTags.length === 1 && searchTags[0].length === 0) { searchTags = [] }

    let response = await API.api_get_files_search_files({ tags: searchTags, return_hashes: true, return_file_ids: false, file_sort_type: sortType.current });
    let responseHashes = response.data.hashes

    setUngroupedHashes(responseHashes) //For use later with grouping
    grabMetaData(responseHashes)
  }

  async function grabMetaData(hashes: Array<string>) {
    const STEP = 100
    let responses = []
    if (hashes.length > 0) {
      for (let i = 0; i < Math.min(i + STEP, hashes.length); i += STEP) {
        let response = await API.api_get_file_metadata({ hashes: hashes.slice(i, Math.min(i + STEP, hashes.length)), hide_service_names_tags: true })
        if (response) { responses.push(response.data.metadata) }
      }
      responses = responses.flat()

      createListOfUniqueTags(responses)
      let h = hashes
      if (groupFiles == true) { h = groupImages(responses, hashes, getGroupNamespace()) }

      sessionStorage.setItem('hashes-search', JSON.stringify(h))

      setHashes(h)
      setLoaded(true)
    }

  }

  function createListOfUniqueTags(responses: Array<API.MetadataResponse>): void {
    //console.time('metajoin')
    let merged = []
    let allKnownTagsKey = sessionStorage.getItem('hydrus-all-known-tags')
    if (!allKnownTagsKey) { allKnownTagsKey = '' }
    for (let element of responses) {
      let serviceKeys = element.service_keys_to_statuses_to_display_tags[allKnownTagsKey]
      if (serviceKeys) { merged.push(serviceKeys[API.ServiceStatusNumber.Current] || []) }
    }
    let map: Map<string, number> = TagTools.tagArrayToMap(merged.flat())
    merged = TagTools.transformIntoTuple(map)
    merged.sort((a, b) => TagTools.compareNamespaces(a, b))
    //console.timeEnd('metajoin')
    setFileTags(merged)
  }

  function setDefaultSearch(): Array<Array<string>> {
    switch (props.type) {
      case 'image':
        return [[]]
      case 'comic':
        return [[getComicNamespace() + ':*'], ['page:0', 'page:1']]
      default:
        return [[]]
    }
  }

  function readParams(par: string | undefined): [tags: Array<Array<string>>, page: string] {
    if (par === undefined) { return [[], '1'] }
    let parameters = new URLSearchParams(par);
    let tags = setDefaultSearch()

    if (parameters.getAll('tags').length != 0) {
      tags = tagArrayToNestedArray(parameters.getAll('tags'))

      for (let tagArray in tags) {
        for (let tag in tags[tagArray]) {
          tags[tagArray][tag] = tags[tagArray][tag].replace('!ANDS', '&')
        }
      }

      //Returns all non empty results, since params sometimes have 'tags=' element
      tags = tags.filter(function (x) { return x[0] !== '' })
      let sortedTags: Array<Array<string>> = []
      for (let tagArray of tags) {
        //If parameter is an OR search
        let s = tagArray[0].split(' OR ') //Always going to be single element array anyway
        if (s.length === 0) { //If Tag is not an OR search
          sortedTags.push([s[0]]) //Wrap in Array for consistency sake so the element ends up as ['tag']
        }
        else {
          sortedTags.push(s) //Just add the given array, this essentialy turns "tag1 OR tag2" into ['tag1,'tag2']
        }
      }
      tags = sortedTags
    }
    let page = '1'
    if (parameters.get('page') != undefined) { page = parameters.get('page') || '1' } //This last OR is to make the checking not whine, it shouldn't ever need to use it

    return [tags, page]
  }

  //Everytime user lands on search page, remove group-hashes item from sessionStorage
  useEffect(() => {
    sessionStorage.removeItem('group-hashes')
  }, [])

  useEffect(() => {
    if (ungroupedHashes?.length > 0) { grabMetaData(ungroupedHashes) }
  }, [groupFiles])

  useEffect(() => {
    refreshParams()
  }, [parm])

  useEffect(() => {
    Search()
  }, [tags])

  useEffect(() => {
    //Adding even slightiest timeout seem to actually make this work, weird
    setTimeout(() => window.scrollTo(0, restoreScroll()), 1)
  }, [loaded])

  function restoreScroll() {
    return parseInt(sessionStorage.getItem('searchScroll') || '0')
  }

  function changePage(newPage: number) {
    let par = generateSearchURL(tags, newPage)

    navigateTo(par)

    sessionStorage.removeItem('searchScroll')
    window.scrollTo(0, 0)
  }

  function navigateTo(parameters: URLSearchParams) {
    switch (props.type) {
      case 'image':
        navigate('/search/' + parameters)
        break
      case 'comic':
        navigate('/comics/' + parameters)
        break
      default:
        navigate('/search/' + parameters)
        break
    }
  }

  function addTag(tag: string) {
    if (tags) {
      if (tag === '') { return; }
      let newTags = tags.slice(); //This gives me copy of tags array instead of pointing to array, needed for update process
      if (newTags.includes([tag])) { return } //If tag exists in array don't add it
      //TODO process certain unique tags that user shouldn't be able to add
      newTags.push([tag]);

      let par = generateSearchURL(newTags, 1)
      navigateTo(par)
    }
  }

  function removeTag(tag: Array<string>) {
    if (tags) {
      let i = tags.indexOf(tag);
      let afterRemove = tags?.slice();
      afterRemove.splice(i, 1);

      let par = generateSearchURL(afterRemove, 1)
      navigateTo(par)
    }
  }
  /** Generates a URLSearchParams from tag array and page number */
  function generateSearchURL(tags: Array<Array<string>> | undefined, page: number): URLSearchParams {
    let parameters = new URLSearchParams({
      page: page.toString()
    })
    if (tags) {
      //For each of the tags turn them from array into a string form
      //Essentialy [['tag1','tag2'],['tag3']] => tags=tag1 OR tag2&tags=tag3
      for (let element of tags) {
        let tagString = ''
        let innerArray = element
        for (let innerElement of innerArray) {
          tagString += innerElement + ' OR '
        }
        tagString = tagString.slice(0, -4)
        tagString = tagString.replace('&', '!ANDS')

        parameters.append('tags', tagString)
      }
    }
    return parameters
  }

  function getContentStyle(): string {
    if (isMobile()) {
      return "contentStyle mobile"
    }
    return "contentStyle"
  }

  //Don't display those namespaces in tag list, eventually to move this into a setting
  const tagBlacklist = getBlacklistedNamespaces()

  function toggleSideBar() {
    setSideBarVisible(!sideBarVisible)
  }

  function getGridStyleList() {
    if (isMobile()) {
      if (sideBarVisible) { return 'gridStyleList mobile active' }
      return "gridStyleList mobile"
    }
    return "gridStyleList"
  }

  function getGridStyleThumbs(): string {
    if (isMobile()) {
      return "gridStyleThumbs mobile"
    }
    return "gridStyleThumbs"
  }

  function getTopBarPaddingStyle(): string {
    if (isMobile()) {
      if (isLandscapeMode()) { return "topBarPadding mobile landscape" }
      return "topBarPadding mobile"
    }
    return "topBarPadding"
  }



  return <>
    <div className={getTopBarPaddingStyle()} />
    {(tags) && <TagSearchBar infoAction={toggleSideBar} groupAction={changeGrouping} addTag={addTag} tags={tags} removeTag={removeTag} />}
    <div className={getContentStyle()}>
      <div className={getGridStyleList()}>
        {(fileTags != undefined) &&
          <TagList
            visibleCount={true}
            tags={fileTags}
            blacklist={tagBlacklist}
            clickFunction={addTag}
            mobile={isMobile()}
          />}
      </div>
      <div className={getGridStyleThumbs()}>
        <ImageWall
          grouping={groupFiles}
          addTag={addTag}
          type={props.type}
          page={params.page}
          hashes={hashes}
          changePage={changePage}
          counts={groupCount}
        />
      </div>
    </div>
  </>;
}
