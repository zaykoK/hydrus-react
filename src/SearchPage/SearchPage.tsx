import { useCallback, useEffect, useRef, useState } from 'react';
import { ImageWall } from "./ImageWall";
import { TagSearchBar } from "./TagSearchbar";
import { useParams, useNavigate } from 'react-router-dom';
import * as API from '../hydrus-backend';
import * as TagTools from '../TagTools';
import { TagList } from '../TagList';

import { getBlacklistedNamespaces, getComicNamespace, getGroupingToggle, getGroupNamespace, getSortType, setSortType } from '../StorageUtils';
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

type SearchResults = {
  results: Array<Result>;
  groupedResults: Array<Result>;
  metadataResponses: Array<API.MetadataResponse>;
}

export type Result = {
  cover: string; //Representant of a result
  entries: Array<API.MetadataResponse>; //List of Metadata responses since they have hash anyway already and this way i get access to all
}

export function SearchPage(props: SearchPageProps) {
  //Search object
  const [searchResults, setSearchResults] = useState<SearchResults>({ results: [], groupedResults: [], metadataResponses: [] })
  //Current search tags
  const [emptySearch, setEmptySearch] = useState<boolean>(false)
  const [tags, setTags] = useState<Array<Array<string>>>()
  //List of unique tags for given files
  const [fileTags, setFileTags] = useState<Array<TagTools.Tuple>>([])
  //Current search parameters, tags(unused?) and current page of search results
  const [params, setParams] = useState<ParamsType>({ tags: [[]], page: 0 })
  //Field that accesses "actual" current URL parameters
  const { parm } = useParams<string>()
  //Whether page has finished loading or not (doesn't work that well now)
  const [loaded, setLoaded] = useState<boolean>(false)
  //Whether panel with tag info should show up (right now only mobile mode has this)
  const [sideBarVisible, setSideBarVisible] = useState<boolean>(false)
  //Whether or not search results should be grouped
  const [groupFiles, setGroupFiles] = useState<boolean>(getGroupingToggle())

  const [loadingProgress, setLoadingProgress] = useState<string>('')

  //Results of previous search, used to check if on a new rerender a search changed
  const previousSearch = useRef<Array<Array<string>>>()
  //Previous search SortType
  const previousSearchSortType = useRef<API.FileSortType>()
  //Sorting order for grabbing files from hydrus API
  const sortType = useRef<API.FileSortType>(getSortType())

  const navigate = useNavigate()

  //console.log(props.globalState?.getGlobalValue())
  //props.globalState?.setGlobalValue('search')

  function changeSortType(newSortType: API.FileSortType) {
    console.log('new sort type is ' + API.FileSortType[newSortType].toString())
    sortType.current = newSortType
    setSortType(newSortType)
    search()
  }

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

    //BASICALLY RESORT METADATA TO FIT RECEIVED HASHES ORDER
    let responsesResorted = []

    let hashesCopy = hashes.slice()
    let responsesCopy = responses.slice()

    let i = 0
    let testSort2 = []
    let testSort3 = []

    console.time('Resorting#2')
    i = 0
    //Approach #2
    //Add break to second loop
    //Keep this for a while until I'm sure there's no problems with approach #3
    /*
    for (let hash in hashesCopy) {
      for (let response in responsesCopy) {
        i += 1

        if (hashesCopy[hash] === responsesCopy[response].hash) {
          testSort2.push(responsesCopy.splice(parseInt(response), 1)[0])
          break
        }
      }
    }
    console.timeEnd('Resorting#2')
    console.log('Steps:' + i)
    */

    console.time('Resorting#3')
    //Approach #3
    //Custom Sort function
    //Convert array into a hash map with given order for each hash
    let hashMap: Map<string, number> = new Map<string, number>()
    hashesCopy.map((value, index, array) => { hashMap.set(value, index) })

    /* This function checks  */
    function compareResponsesByHash(a: API.MetadataResponse, b: API.MetadataResponse): number {
      let hashA = hashMap.get(a.hash)
      let hashB = hashMap.get(b.hash)
      //If for some reason one of the hashes doesn't exist consider equal
      if ((hashA === undefined) || (hashB === undefined)) {
        console.warn('Hashes: \n' + a.hash + "\n" + 'b.hash\n' + 'did not get a result in initial search.')
        return 0
      }
      if (hashA < hashB) { return -1 }
      if (hashA > hashB) { return 1 }
      return 0
    }
    testSort3 = responsesCopy.sort((a, b) => compareResponsesByHash(a, b))
    console.timeEnd('Resorting#3')

    //console.log("Are sorting results same?")
    //console.log(JSON.stringify(testSort2) === JSON.stringify(testSort3))

    responsesResorted = testSort3

    let responsesSorted = responsesResorted

    let resultMap: Map<string, Result> = new Map<string, Result>()
    let unsortedArray: Array<Result> = []

    for (let element of responsesSorted) {
      unsortedArray.push({ cover: element.hash, entries: [element] })
      //TODO move tag grabbing (response.service_to_...[etc]) into own function to make code easier to read

      //Grab key for 'all known tags' service from session storage, if properly grabbed API key then should work
      let allKnownTagsKey = sessionStorage.getItem('hydrus-all-known-tags');
      if (!allKnownTagsKey) { allKnownTagsKey = ''; console.error('Could not grab "all known tags" key from sessionStorage, this is bad.') }
      let serviceKeys = element.service_keys_to_statuses_to_display_tags[allKnownTagsKey]
      if (serviceKeys) {
        //For each entry in metadataResponses 
        //Turn response into a tag map (key:'tag text', value:'counts of tag, should be 1 for everything anyway'),
        //*this is used so it filters out duplicate tags?, not sure why i'm doing this here, probably just to easily move between coversion functions
        //Then filter from those responses tags that match given namespace, here "whatever you set as your grouping namespace" and "page"


        //This turns the responses into a map for later filtering
        //transformIntoTuple could be done once frankly, saving some execution time
        let filter = TagTools.tagArrayToMap(serviceKeys[API.ServiceStatusNumber.Current] || [])
        //This gives all tags for grouping namespace, ideally only 1 result should exist
        let filterTags = TagTools.transformIntoTuple(filter).filter((element) => element["namespace"] === groupNamespace)
        //This gives the page tags for given file, ideally should exist only 1 but who knows
        //let pageTags = TagTools.transformIntoTuple(filter).filter((element) => element["namespace"] === 'page')

        if (filterTags.length !== 0) { //Don't create group for files with no group namespace
          let tempResult = resultMap.get(filterTags[0].value)           //Check if tag group already exist in tempResult
          if (tempResult != undefined) {           //If exist update with appending a current one
            resultMap.set(filterTags[0].value, { cover: tempResult.cover, entries: [...tempResult.entries, element] })
          }
          else {           //If not create a new entry
            resultMap.set(filterTags[0].value, { cover: element.hash, entries: [element] })
          }
        }
        else { //If no grouping namespaces just push a single
          resultMap.set(element.hash, { cover: element.hash, entries: [element] })
        }
      }
    }
    let returnHashes: Array<string> = []
    let searchArray: Array<Result> = []
    resultMap.forEach((entry) => {
      returnHashes.push(entry.cover)
      searchArray.push(entry)
    })

    setSearchResults({ results: unsortedArray, metadataResponses: responsesSorted, groupedResults: searchArray })
    return returnHashes //This is what will be displayed in the end
  }

  async function search() {
    //If there is nothing to search for or search is identical to previous don't do anything
    if (tags === undefined) {
      //console.log('not doing anything undefined');
      return
    }

    //console.log(previousSearchSortType.current )
    //console.log(sortType.current )
    //console.log(previousSearchSortType.current  === sortType.current )
    //console.log('are searches equal?')
    //console.log(JSON.stringify(tags) === JSON.stringify(previousSearch.current))

    if ((previousSearchSortType.current === sortType.current) && (JSON.stringify(tags) === JSON.stringify(previousSearch.current))) {
      console.log("not doing anything same search")
      return
    }
    if (loaded) { sessionStorage.removeItem('searchScroll') }
    setLoaded(false)


    previousSearch.current = tags.slice()
    previousSearchSortType.current = sortType.current
    let searchTags = tags.slice()
    if (searchTags.length === 1 && searchTags[0].length === 0) { searchTags = [] }
    if (props.type === 'comic') {
      searchTags.push([getComicNamespace() + ':*'])
      searchTags.push(['page:0', 'page:1'])
    }
    //console.log('actually searching')
    //console.log(sortType.current)
    let response = await API.api_get_files_search_files({ tags: searchTags, return_hashes: true, return_file_ids: false, file_sort_type: sortType.current });
    let responseHashes: Array<string> = response.data.hashes
    //console.log(responseHashes)
    if (responseHashes.length === 0) {
      setEmptySearch(true)
    }
    else {
      setEmptySearch(false)
    }

    setLoadingProgress('0/' + responseHashes.length)

    grabMetaData(responseHashes)
  }

  async function grabMetaData(hashes: Array<string>) {
    //console.time('meta')
    //Might require higher than default 'large_client_header_buffers' in nginx configuration if using ssl proxy
    //Otherwise you will get an error when getting metadata with this large request
    //Workaround - lower STEP variable to something like 50
    const STEP = 1000
    let responses: Array<API.MetadataResponse> = []
    let fileTags: Array<TagTools.Tuple> = []

    let responseSize = 0
    let responseSizeReadable = ''

    let thingy = false

    if (hashes.length > 0) {
      for (let i = 0; i < Math.min(i + STEP, hashes.length); i += STEP) {
        let response = await API.api_get_file_metadata({ hashes: hashes.slice(i, Math.min(i + STEP, hashes.length)), hide_service_names_tags: true })
        if (thingy === false) { thingy = true }
        if (response) { responses.push(response.data.metadata); responseSize += JSON.stringify(response).length }
        if (responseSize > 512) { //KB
          responseSizeReadable = (responseSize * 2).toLocaleString().slice(0, -4) + 'kB'
        }
        if (responseSize > 1024 * (512)) { //MB
          responseSizeReadable = (responseSize * 2).toLocaleString().slice(0, -4) + 'MB'
        }
        if (responseSize < 512) {
          responseSizeReadable = (responseSize * 2).toLocaleString() + 'B'
        }
        setLoadingProgress(i + '/' + hashes.length + ' (' + responseSizeReadable + ')')
      }
      responses = responses.flat()
      setLoadingProgress(hashes.length + '/' + hashes.length + ' (' + responseSizeReadable + ')')

      console.time('GroupImages')

      fileTags = createListOfUniqueTags(responses)
      let h = hashes
      if (props.type === 'comic') {
        h = groupImages(responses, hashes, getComicNamespace())
      }
      else {
        h = groupImages(responses, hashes, getGroupNamespace())
      }

      console.timeEnd('GroupImages')

      sessionStorage.setItem('hashes-search', JSON.stringify(h))
      setLoaded(true)
    }
    setFileTags(fileTags)
    //console.timeEnd('meta')
  }

  function createListOfUniqueTags(responses: Array<API.MetadataResponse>): Array<TagTools.Tuple> {
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
    return merged

  }

  function setDefaultSearch(): Array<Array<string>> {
    switch (props.type) {
      case 'image':
        return [[]]
      case 'comic':
        return [[]]
      // Removed because I added it in search function, should be better user experience without those 2 queries visible
      //return [[getComicNamespace() + ':*'], ['page:0', 'page:1']]
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
    console.log('parm changed')
    refreshParams()
  }, [parm])

  useEffect(() => {
    search()
    console.log('doing search cause sortType or tags changed')
  }, [tags, sortType])

  useEffect(() => {
    console.log('changed')
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

  function newAddTag(tag: string, tags: Array<Array<string>>) {
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

  const addTagCallback = useCallback((tag: string) => {
    console.log('doing sometinhg')
    addTag(tag)
  }, [])

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
    let style = 'contentStyle'
    if (isMobile()) {
      style += " mobile"
    }
    if (props.type === 'comic') {
      style += ' contentStyleComic'
    }
    return style
  }

  //Don't display those namespaces in tag list, eventually to move this into a setting
  const tagBlacklist = useRef(getBlacklistedNamespaces())

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

  /* Mobile Layout */
  if (isMobile()) {
    return <>
      <div className={getGridStyleList()}>
        {(fileTags != undefined) &&
          <TagList
            visibleCount={true}
            tags={fileTags}
            blacklist={tagBlacklist.current}
            clickFunction={addTag}
          />}
      </div>

      <div className={getTopBarPaddingStyle()} />
      {(tags) && <TagSearchBar infoAction={toggleSideBar} sortTypeChange={changeSortType} groupAction={changeGrouping} addTag={addTag} tags={tags} removeTag={removeTag} />}
      <ImageWall
        grouping={groupFiles}
        addTag={addTag}
        type={props.type}
        page={params.page}
        hashes={(groupFiles) && searchResults.groupedResults || searchResults.results}
        changePage={changePage}
        loadingProgress={loadingProgress}
        loaded={loaded}
        empty={emptySearch}
      />
    </>;
  }
  console.log('desktop layout')
  /* Desktop Layout */
  return <>
    <div className={getTopBarPaddingStyle()} />
    {(tags) && <TagSearchBar infoAction={toggleSideBar} sortTypeChange={changeSortType} groupAction={changeGrouping} addTag={addTag} tags={tags} removeTag={removeTag} />}
    <div className={getContentStyle()}>
      {(props.type !== 'comic') && <div className={getGridStyleList()}>
        {(fileTags != undefined) &&
          <TagList
            visibleCount={true}
            tags={fileTags}
            blacklist={tagBlacklist.current}
            clickFunction={addTag}
          />}
      </div>}
      <div className={getGridStyleThumbs()}>
        <ImageWall
          grouping={groupFiles}
          addTag={addTag}
          type={props.type}
          page={params.page}
          hashes={(groupFiles) && searchResults.groupedResults || searchResults.results}
          changePage={changePage}
          loadingProgress={loadingProgress}
          loaded={loaded}
          empty={emptySearch}
        />
      </div>
    </div>
  </>;
}
