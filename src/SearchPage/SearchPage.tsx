import { useEffect, useRef, useState } from 'react'
import { ImageWall } from "./ImageWall"
import { TagSearchBar } from "./TagSearchbar"
import { useParams } from 'react-router-dom'
import * as API from '../hydrus-backend'
import * as TagTools from '../TagTools'
import { TagList } from '../TagList'

import { getBlacklistedNamespaces, getComicNamespace, getGroupingToggle, getGroupNamespace, getSortType, setSortType } from '../StorageUtils'
import { setPageTitle } from '../misc'

import './SearchPage.css'
import { isLandscapeMode, isMobile } from '../styleUtils'
import localforage from 'localforage'
import { addTag, createListOfUniqueTags } from './SearchPageHelpers'

import { FilePage } from '../FilePage/FilePage'
import { readParams } from './URLParametersHelpers'

interface SearchPageProps {
  type: string;
  setNavigationExpanded: Function;
}

type ParamsType = {
  tags: Array<Array<string>>;
  page: number;
  hash: string;
  type: string;
}

type SearchResults = {
  results: Array<ResultGroup>;
  groupedResults: Array<ResultGroup>;
  metadataResponses: Array<API.MetadataResponse>;
  hashes?: Array<string>;
}

export type ResultGroup = {
  cover: string; // This is a hash for cover image of the group
  title: string; // title of the group - should allow for for easy searching for the rest of the group with adding * after it
  subgroups: Map<string, ResultGroup>; // Subgroups if any
  entries: Array<API.MetadataResponse>; // This will be probably empty for groups that also have subgroups as those files should belong to the subgroups entries
}

export function changePage() {

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
  const [params, setParams] = useState<ParamsType>({ tags: [[]], page: 0, hash: '', type: props.type })
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
  const searchType = useRef<string>(props.type)

  const AbortControllerSearch = useRef<AbortController | undefined>()

  //const navigate = useNavigate()

  function changeSortType(newSortType: API.FileSortType) {
    console.log('new sort type is ' + API.FileSortType[newSortType].toString())
    sortType.current = newSortType
    setSortType(newSortType)
    search()
  }

  function changeGrouping() {
    localStorage.setItem('group-toggle', (!groupFiles).toString())
    setGroupFiles(!groupFiles)
  }

  function groupImages(responses: Array<API.MetadataResponse>, hashes: Array<string>, groupNamespace: string = 'group-title') {
    function processTieredGroup(groupString: string, metadata: API.MetadataResponse, resultGroupMap: Map<string, ResultGroup>) {
      const SplitSymbol = '/'
      // Idea is that groups can get subgroups
      // Scheme is as following <group-namespace>:<master group>/<sub group 1>/<sub group 2> etc.
      // So let's say we have a set that might have 12 pictures out of which only 4 are actually distinct(they have 3 variants each)
      // This way we can group them independentely for each image but also keep them coherent for ordered sets, 
      // where you sometimes get standalone images that combined create some sort of narrative
      // Subgroups can essentialy save as ordered pages explicitely tied to a group
      // IMPORTANT - this does create a necesssity to understand that '/' symbol is for splitting
      //
      // Split by this symbol
      let splitted = groupString.split(SplitSymbol)

      // Nidoqueen,1
      // Nidoqueen,2

      let result = resultGroupMap.get(splitted[0])
      // If group map already has entry append this one to it
      if (result !== undefined) {
        resultGroupMap.set(splitted[0], appendToSubGroup(splitted.splice(1), metadata, result))
      }
      else { // Else create new one
        resultGroupMap.set(splitted[0], createSubGroup(splitted, metadata))
      }
    }
    // This essentialy overwrites already existing group
    function appendToSubGroup(stack: Array<string>, metadata: API.MetadataResponse, currentResultGroup: ResultGroup): ResultGroup {
      // If there are any more subgroups
      if (stack.length > 0) {
        // If subgroups exists give me back current group object with modified subgroup
        let currentSubGroup = currentResultGroup.subgroups.get(stack[0])
        if (currentSubGroup !== undefined) { //Subgroup already exist
          let subgroups = currentResultGroup.subgroups
          currentResultGroup.subgroups.set(stack[0], appendToSubGroup(stack.slice(1), metadata, currentSubGroup))



          let group: ResultGroup = {
            cover: currentResultGroup.cover,
            title: currentResultGroup.title,
            subgroups: subgroups,
            entries: currentResultGroup.entries
          }

          return group
        }
        else { // Else append a new one
          // Get existing subgroups
          let subgroups = currentResultGroup.subgroups
          // Add the new one
          subgroups.set(stack[0], createSubGroup(stack, metadata))
          // Create new object with updated subgroups data and return it
          let group: ResultGroup = {
            cover: currentResultGroup.cover,
            title: currentResultGroup.title,
            subgroups: subgroups,
            entries: currentResultGroup.entries
          }
          return group
        }
      }
      else { // If not just add current metadata to entries
        let group: ResultGroup = {
          cover: currentResultGroup.cover,
          title: currentResultGroup.title,
          subgroups: currentResultGroup.subgroups,
          entries: [...currentResultGroup.entries, metadata]
        }
        return group
      }

    }

    function createSubGroup(groups: Array<string>, metadata: API.MetadataResponse): ResultGroup {
      let subgroups: Map<string, ResultGroup> = new Map<string, ResultGroup>()
      if (groups.length > 0) {
        //console.log("Doing group:" + groups)
        //console.log("It's length is : "+ groups.length)
        //console.log("It's subgroup slice is: " + groups.slice(1))

        let entries: Array<API.MetadataResponse>
        if (groups.length === 1) {
          entries = [metadata]
        }
        else {
          subgroups.set(groups[1], createSubGroup(groups.slice(1), metadata))
          entries = []
        }

        let resultGroup: ResultGroup = {
          cover: metadata.hash,
          title: groups[0],
          subgroups: subgroups,
          entries: entries
        }
        return resultGroup
      }
      // This is a single file result
      return {
        cover: metadata.hash,
        title: metadata.hash,
        subgroups: subgroups,
        entries: [metadata]
      }
    }
    //#######################################################################
    //TODO
    //Sort tags in groups according to page(or some other) order
    //Add option to use oldest file in group as representant

    //BASICALLY RESORT METADATA TO FIT RECEIVED HASHES ORDER
    let hashesCopy = hashes.slice()
    let responsesCopy = responses.slice()

    //Approach #3
    //Custom Sort function
    //Convert array into a hash map with given order for each hash
    let hashMap: Map<string, number> = new Map<string, number>()
    hashesCopy.map((value, index, array) => { hashMap.set(value, index) })

    /* This function compares order of hashes */
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

    let responsesSorted = responsesCopy.sort((a, b) => compareResponsesByHash(a, b))

    //let resultMap: Map<string, Result> = new Map<string, Result>()
    let unsortedArray: Array<ResultGroup> = []

    let resultGroupMap: Map<string, ResultGroup> = new Map<string, ResultGroup>()

    //Grab key for 'all known tags' service from session storage, if properly grabbed API key then should work
    let allKnownTagsKey = sessionStorage.getItem('hydrus-all-known-tags') || '';
    if (!allKnownTagsKey || allKnownTagsKey === null) { allKnownTagsKey = ''; console.error('Could not grab "all known tags" key from sessionStorage, this is bad.') }

    for (let element of responsesSorted) {
      unsortedArray.push({ cover: element.hash, title: element.hash, subgroups: new Map<string, ResultGroup>(), entries: [element] })
      //TODO move tag grabbing (response.service_to_...[etc]) into own function to make code easier to read


      let serviceKeys = element.service_keys_to_statuses_to_display_tags[allKnownTagsKey]
      if (serviceKeys) {
        //For each entry in metadataResponses 
        //Turn response into a tag map (key:'tag text', value:'counts of tag, should be 1 for everything anyway'),
        //*this is used so it filters out duplicate tags?, not sure why i'm doing this here, probably just to easily move between coversion functions
        //Then filter from those responses tags that match given namespace, here "whatever you set as your grouping namespace" and "page"


        //This turns the responses into a map for later filtering
        //transformIntoTuple could be done once frankly, saving some execution time
        let tagMap = TagTools.tagArrayToMap(serviceKeys[API.ServiceStatusNumber.Current] || [])

        let tagTuples = TagTools.transformIntoTuple(tagMap)

        // This gives all tags for grouping namespace, ideally only 1 result should exist
        let foundGroupTags = tagTuples.filter((element) => element["namespace"] === groupNamespace)
        // Same just for comic tags
        let foundComicTags = tagTuples.filter((element) => element["namespace"] === getComicNamespace())

        // I can do cool stuff like this now
        // This groups all images by their creator tag
        //let filterTags = TagTools.transformIntoTuple(filter).filter((element) => element["namespace"] === 'creator')

        //This gives the page tags for given file, ideally should exist only 1 but who knows
        //let pageTags = TagTools.transformIntoTuple(filter).filter((element) => element["namespace"] === 'page')

        // Determine whether to use comic tags or group tags
        // Mby add some user setting to choose which you prefer
        let usedNamespace = 'group'
        if (foundComicTags.length > 0) {
          usedNamespace = 'comic'
        }

        if (usedNamespace === 'group') {
           // For each of group tags create a result group
        for (let result of foundGroupTags) {
          processTieredGroup(result.value, element, resultGroupMap)
        }
        // Create a solo result group for files without any grouping
        if (foundGroupTags.length === 0) {
          processTieredGroup(element.hash, element, resultGroupMap)
        }
        }
        if (usedNamespace === 'comic') {
          for (let result of foundComicTags) {
            processTieredGroup(result.value, element, resultGroupMap)
          }
        }

       
        // I'm going to make an assumption, that every file inside a group is going to have info about the groups it's in
        // > It would be easier if groups had proper support in hydrus itself, as then I would probably only need to pull one set of data and that's it
        // That might hold things like flags as to how display a given group, I'm mostly seeing it as a way to for example decide by user whether they want a given group to display as single results or have entries for every subgroup
      }
    }
    //console.log(resultGroupMap)
    let returnHashes: Array<string> = []
    let searchArray: Array<ResultGroup> = []

    function sortResults(a: { hash: string, page: Array<TagTools.Tuple>, modifiedDate: number }, b: { hash: string, page: Array<TagTools.Tuple>, modifiedDate: number }): number {
      // If one of results have pages and other doesn't put the one that does first
      if (a.page.length > 0 && b.page.length === 0) {
        return -1
      }
      if (a.page.length === 0 && b.page.length > 0) {
        return 1
      }
      // If posssible to compare pages
      // Sort by page number
      if (a.page.length > 0 && b.page.length > 0) {
        return parseInt(a.page[0].value) - parseInt(b.page[0].value)
      }
      else { //Compare by import date
        return a.modifiedDate - b.modifiedDate
      }
    }

    // This whole thing basically sorts the internals of the results
    // TODO - Rewrite for new format
    resultGroupMap.forEach((entry) => {
      // Return each group hash representant (cover)
      // Sort internal lists (somehow)

      returnHashes.push(entry.cover)
      searchArray.push(entry)

    })

    let searchResultObject: SearchResults = { results: unsortedArray, metadataResponses: responsesSorted, groupedResults: searchArray }

    //localforage.setItem('search-results-cache', JSON.stringify(searchResultObject))
    setSearchResults(searchResultObject)
    return returnHashes //This is used to keep search result cached
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

    if ((previousSearchSortType.current === sortType.current) && (JSON.stringify(tags) === JSON.stringify(previousSearch.current)) && ((searchType.current === params.type))) {
      //console.log("not doing anything same search")
      return

    }
    setLoaded(false)
    if (AbortControllerSearch.current) {
      AbortControllerSearch.current.abort()
    }
    AbortControllerSearch.current = new AbortController()

    previousSearch.current = tags.slice()
    previousSearchSortType.current = sortType.current
    let searchTags = tags.slice()
    if (searchTags.length === 1 && searchTags[0].length === 0) { searchTags = [] }
    if (params.type === 'comic') {
      searchTags.push([getComicNamespace() + ':*'])
      searchTags.push(['page:0', 'page:1'])
    }
    //console.log('actually searching')
    //console.log(sortType.current)
    let response = await API.api_get_files_search_files({ tags: searchTags, return_hashes: true, return_file_ids: false, file_sort_type: sortType.current, abortController: AbortControllerSearch.current });
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
    let STEP = 1000
    let loadSize = localStorage.getItem('metadata-load-size')
    if (loadSize !== null) {
      STEP = parseInt(loadSize)
    }

    let responses: Array<API.MetadataResponse> = []
    let fileTags: Array<TagTools.Tuple> = []

    let responseSize = 0
    let responseSizeReadable = ''

    //If there are any results
    if (hashes.length > 0) {
      //Load the session storage metadata if exist
      //console.time('localforage')
      //let cacheHashes: Array<string> = JSON.parse(await localforage.getItem('search-metadata-cache-hashes') as string)
      //let cacheResponses: Array<API.MetadataResponse> = JSON.parse(await localforage.getItem('search-metadata-cache-responses') as string)
      //let cacheResults: SearchResults = JSON.parse(await localforage.getItem('search-results-cache') as string)
      //console.log(cacheResults)
      //console.timeEnd('localforage')

      //If current hashes matches cached search result just use that
      // if ((cacheResults !== null) && (JSON.stringify(cacheHashes) === JSON.stringify(hashes))) {
      //   //console.log('loading cached results')
      //   responses = cacheResults.metadataResponses
      //   fileTags = createListOfUniqueTags(responses)
      //   sessionStorage.setItem('hashes-search', JSON.stringify(cacheResults.hashes))
      //   setLoaded(true)
      //   setFileTags(fileTags)
      //   setSearchResults(cacheResults)
      //   return
      //}
      //Else load them from the server and then add do indexedDB
      //else {
      let hashesLength = hashes.length //Apparantely it's a good practice and is faster to do it this way
      for (let i = 0; i < Math.min(i + STEP, hashesLength); i += STEP) {
        let response = await API.api_get_file_metadata({ hashes: hashes.slice(i, Math.min(i + STEP, hashes.length)), hide_service_names_tags: true, abortController: AbortControllerSearch.current })
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
        setLoadingProgress(i + '/' + hashes.length + '\n(' + responseSizeReadable + ')')
      }
      responses = responses.flat()
      //Save results for later
      //localforage.setItem('search-metadata-cache-hashes', JSON.stringify(hashes))
      //localforage.setItem('search-metadata-cache-responses', JSON.stringify(responses))

      setLoadingProgress(hashes.length + '/' + hashes.length + ' (' + responseSizeReadable + ')')
      //}

      //console.time('GroupImages')

      fileTags = createListOfUniqueTags(responses)
      let h = hashes
      if (params.type === 'comic') {
        h = groupImages(responses, hashes, getComicNamespace())
      }
      else {
        h = groupImages(responses, hashes, getGroupNamespace())
      }

      //console.timeEnd('GroupImages')

      //This exists for Previous/Next Image controls
      sessionStorage.setItem('hashes-search', JSON.stringify(h))
      setLoaded(true)
    }
    setFileTags(fileTags)
    //console.timeEnd('meta')
  }

  //Everytime user lands on search page, remove group-hashes item from sessionStorage
  useEffect(() => {
    sessionStorage.removeItem('group-hashes')
  }, [])

  useEffect(() => {
    function refreshParams(): void {
      let p = readParams(parm)
      /*WARNING - this is not exactly correct way to do this
      There is a weird occurence when sometimes empty tag parameter gets added to the page url --> "&tags="
      When this happens on empty search compare doesn't work properly as it is comparing [] and [[]] objects
      When that compare fails opening/closing image viewer overlay will re-render whole search page, losing scroll progress
      Unfortunately (or fortunately) this happened once to me and I can't replicate that behaviour anymore,
       seems that changing default search value somehow "fixed it", so I'm not bothering with trying to fix it more
      */

      setPageTitle(p.tags, parseInt(p.page), p.type)
      setParams({ tags: p.tags, page: parseInt(p.page), hash: p.hash, type: p.type })

      let tagsForTestingPurpose = tags || [[]]
      if (JSON.stringify(tagsForTestingPurpose) !== JSON.stringify(p.tags)) {
        setTags(p.tags)
      }

      sessionStorage.setItem('currently-displayed-hash', p.hash)
      sessionStorage.setItem('current-search-tags', JSON.stringify(p.tags))
    }

    refreshParams()
  }, [parm])

  useEffect(() => {
    search()
  }, [tags, sortType, params.type])

  useEffect(() => {
    //Adding even slightiest timeout seem to actually make this work, weird
    //setTimeout(() => window.scrollTo(0, restoreScroll()), 1)
  }, [loaded])

  //This is used to block scrolling behind file page, it gets the html section and just blocks all scrolling from it
  useEffect(() => {
    const html = document.getElementsByTagName('html')[0]
    if (params.hash !== '') {
      html.classList.add('prevent-scroll')
    }
    else {
      html.classList.remove('prevent-scroll')
    }
  }, [params.hash])

  function getContentStyle(): string {
    let style = 'contentStyle'
    if (isMobile()) {
      style += " mobile"
    }
    if (params.type === 'comic') {
      style += ' contentStyleComic'
    }
    return style
  }

  //Don't display those namespaces in tag list, eventually to move this into a setting
  const tagBlacklist = useRef(getBlacklistedNamespaces())

  function toggleSideBar(setting?: boolean) {
    if (setting !== undefined) { setSideBarVisible(setting); return }
    setSideBarVisible(!sideBarVisible)
  }

  function getGridStyleList() {
    let style = 'gridStyleList'
    if (isMobile()) {
      style += ' mobile'
      if (sideBarVisible) { style += ' active' }
    }
    return style
  }

  function getGridStyleThumbs(): string {
    let style = 'gridStyleThumbs'
    if (isMobile()) {
      style += ' mobile'
    }
    return style
  }

  function getTopBarPaddingStyle(): string {
    let style = 'topBarPadding'
    if (isMobile()) {
      style += ' mobile'
      if (isLandscapeMode()) {
        style += ' landscape'
      }
    }
    return style
  }

  /* Mobile Layout */
  if (isMobile()) {
    return <>
      <div className={getGridStyleList()}>
        {(fileTags !== undefined) &&
          <TagList
            visibleCount={true}
            tags={fileTags}
            blacklist={tagBlacklist.current}
            type={params.type}
          />}
      </div>

      <div className={getTopBarPaddingStyle()} />
      {(tags) && <TagSearchBar type={params.type} setNavigationExpanded={props.setNavigationExpanded} infoAction={toggleSideBar} sortTypeChange={changeSortType} groupAction={changeGrouping} tags={tags} />}
      <ImageWall
        grouping={groupFiles}
        addTag={addTag}
        type={params.type}
        page={params.page}
        results={(groupFiles) ? searchResults.groupedResults : searchResults.results}
        changePage={changePage}
        loadingProgress={loadingProgress}
        loaded={loaded}
        empty={emptySearch}
      />
      {(params.hash !== '') && <div className='fullscreenWrapper'> <FilePage setNavigationExpanded={props.setNavigationExpanded} hash={params.hash} /></div>}
    </>;
  }
  /* Desktop Layout */
  return <>
    <div className={getTopBarPaddingStyle()} />
    {(tags) && <TagSearchBar type={params.type} setNavigationExpanded={props.setNavigationExpanded} infoAction={toggleSideBar} sortTypeChange={changeSortType} groupAction={changeGrouping} tags={tags} />}
    <div className={getContentStyle()}>
      {(params.type !== 'comic') && <div className={getGridStyleList()}>
        {(fileTags !== undefined && loaded) &&
          <TagList
            visibleCount={true}
            tags={fileTags}
            blacklist={tagBlacklist.current}
            clickFunction={addTag}
            type={params.type}
          />}
      </div>}
      <div className={getGridStyleThumbs()}>
        <ImageWall
          key={searchResults.groupedResults.toString()}
          grouping={groupFiles}
          addTag={addTag}
          type={params.type}
          page={params.page}
          results={(groupFiles) ? searchResults.groupedResults : searchResults.results}
          changePage={changePage}
          loadingProgress={loadingProgress}
          loaded={loaded}
          empty={emptySearch}
        />
      </div>
    </div>
    {(params.hash !== '') && <div className='fullscreenWrapper'> <FilePage setNavigationExpanded={props.setNavigationExpanded} hash={params.hash} /></div>}
  </>;
}
