import React, { useEffect, useState } from 'react';
import { ImageWall } from "./ImageWall";
import { SearchTags } from "./SearchTags";
import { useParams, useNavigate } from 'react-router-dom';
import * as API from './hydrus-backend';
import TagDisplay from './TagDisplay';
import * as TagTools from './TagTools';
import { TagList } from './TagList';


export function SearchPage(props) {
  const [tags, setTags] = useState();
  const [hashes, setHashes] = useState([])
  const [ungroupedHashes, setUngroupedHashes] = useState([])
  const [lastSearch, setLastSearch] = useState()
  const [params, setParams] = useState({ tags: undefined, page: undefined })
  const [fileTags, setFileTags] = useState()
  const [groupFiles, setGroupFiles] = useState(getGroupingToggle())
  const { parm } = useParams()

  const [width, setWidth] = useState(window.innerWidth)

  const navigate = useNavigate();

  function refreshParams() {
    let [t, p] = readParams(parm)

    setPageTitle(t, p)
    setParams({ tags: t, page: p })
    setTags(t)
  }

  function changeGrouping() {
    localStorage.setItem('group-toggle', !groupFiles)
    setGroupFiles(!groupFiles)
  }

  function groupImages(responses, hashes, groupNamespace = 'group-title') {
    //Super inefficient way to group images together, to optimize later

    //Map response into hash => file tags
    let tMap = new Map()
    for (let element in responses) {
      //console.log(responses[element])
      let filterTags = TagTools.transformIntoTuple(responses[element].service_keys_to_statuses_to_display_tags[sessionStorage.getItem('hydrus-all-known-tags')][0]).filter((element) => element["namespace"] === groupNamespace)
      let pageTags = TagTools.transformIntoTuple(responses[element].service_keys_to_statuses_to_display_tags[sessionStorage.getItem('hydrus-all-known-tags')][0]).filter((element) => element["namespace"] === 'page')
      if (filterTags.length !== 0) { //Don't create group for files with no group namespace
        tMap.set(
          responses[element].hash,
          [filterTags,pageTags,responses[element].time_modified]
        )
      }
    }
    //Map files into tag => hashes with that tag format
    let hMap = new Map()
    tMap.forEach((value, key, map) => {
      //console.log(value)
      let groupTitle = value[0][0].value
      //console.log(groupTitle)
      if (hMap.has(groupTitle)) {
        let v = hMap.get(groupTitle)
        //console.log(v)
        hMap.set(groupTitle, [[...v[0], key],[...v[1],value[1]],[...v[2],value[2]]]) //can't use push with maps so that's what I do
      }
      else {
        hMap.set(groupTitle, [[key],[value[1]],[value[2]]])
      }
    })
    //TODO
    //Sort tags in groups according to page(or some other) order
    //Add option to use oldest file in group as representant



    //Grab a copy of all search hashes
    let hashesCopy = hashes.slice()
    //Remove hashes from grouped up files except for first one(seems to always be the newest file in group)
    hMap.forEach((value, key, map) => {
      //console.log("TESt")
      //console.log(value.slice(0,-1))
      //console.log(value.slice(1))
      //console.log(value)
      let removed = []
      for ( let v in value[0].slice(1) ) {
        //value.slice(1) - first element encounter, should always be newest
        //value.slice(0,-1) - last element encountered, should be oldest file
        removed.push(hashesCopy.splice(hashesCopy.indexOf(value[0][v]), 1))
      }
      //console.log(removed)
    })
    return hashesCopy
  }

  function getGroupingToggle() {
    if (localStorage.getItem('group-toggle') === null) {
      return false
    }
    //because of string conversion, check on string is done first
    if (localStorage.getItem('group-toggle') === 'true') { return true }
    return false
  }

  function getGroupNamespace() {
    if (localStorage.getItem('group-namespace') === null) {
      return 'group-title'
    }
    return localStorage.getItem('group-namespace')
  }

  async function Search() {
    //If there is nothing to search for or search is identical to previous don't do anything
    if (tags === undefined || JSON.stringify(tags) === JSON.stringify(lastSearch)) { return }
    setLastSearch(tags.slice())

    let response = await API.api_get_files_search_files({ tags: tags, return_hashes: true, return_file_ids: false });
    let responseHashes = response.data.hashes

    setUngroupedHashes(responseHashes) //For use later with grouping
    grabMetaData(responseHashes)
  }

  async function grabMetaData(hashes) {
    let step = 100
    let responses = []
    if (hashes.length > 0) {

      for (let i = 0; i < Math.min(i + step, hashes.length); i += step) {
        let response = await API.api_get_file_metadata({ hashes: hashes.slice(i, Math.min(i + step, hashes.length)), hide_service_names_tags: true })
        responses.push(response.data.metadata)
      }
      responses = responses.flat()


      createListOfUniqueTags(responses)
      let h = hashes
      if (groupFiles == true) { h = groupImages(responses, hashes, getGroupNamespace()) }

      setHashes(h)

    }
  }

  function createListOfUniqueTags(responses) {
    //console.time('metajoin')
    let merged = []
    for (let element in responses) {
      merged.push(responses[element].service_keys_to_statuses_to_display_tags[sessionStorage.getItem('hydrus-all-known-tags')][0])
    }

    merged = TagTools.transformIntoTuple([...new Set(merged.flat())])
    merged.sort((a, b) => TagTools.compareNamespaces(a, b))
    //console.timeEnd('metajoin')
    setFileTags(merged)
  }

  function setPageTitle(tags, page) {
    if (tags.length === 0) {
      switch (props.type) {
        case 'image':
          document.title = 'search page ' + page
          break
        case 'comic':
          document.title = 'comics page ' + page
          break
        default:
          document.title = 'search page ' + page
      }
    }
    else {
      switch (props.type) {
        case 'image':
          document.title = tags + ', page ' + page
          break
        case 'comic':
          document.title = 'comics page ' + page
          break
        default:
          document.title = 'comics: ' + tags + ', page ' + page
      }

    }
  }

  function returnComicNamespace() {
    if (localStorage.getItem('comic-namespace') != undefined) {
      return localStorage.getItem('comic-namespace')
    }
    else {
      return 'doujin-title'
    }
  }

  function setDefaultSearch() {
    switch (props.type) {
      case 'image':
        return []
      case 'comic':
        return [returnComicNamespace() + ':*', ['page:0', 'page:1']]
      default:
        return []
    }
  }

  function readParams(parameters) {
    let par = new URLSearchParams(parameters);
    let tags = setDefaultSearch()
    if (par.getAll('tags').length != 0) {
      tags = par.getAll('tags')
      tags = tags.filter(function (x) { return x !== '' })
      let sortedTags = []
      for (let tag in tags) {
        let s = tags[tag].split(' OR ')
        if (s.length === 0) {
          sortedTags.push(s[0])
        }
        else {
          sortedTags.push(s)
        }
      }
      tags = sortedTags
    }
    let page = '1'
    if (par.get('page') != undefined) { page = par.get('page') }

    return [tags, page]
  }

  useEffect(() => {
    grabMetaData(ungroupedHashes)
  }, [groupFiles])

  useEffect(() => {
    let [t, p] = readParams(parm)

    setPageTitle(t, p)
    setParams({ tags: t, page: p })
    setTags(t)
  }, [])

  useEffect(() => {
    refreshParams()
  }, [parm])

  useEffect(() => {
    Search()
  }, [tags])



  function changePage(newPage) {
    let par = generateSearchURL(tags, newPage)
    navigateTo(par)
  }


  function navigateTo(parameters) {
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


  function addTag(tag) {
    console.log('adding tag:' + tag)
    if (tag === '') { return; }
    let newTags = tags.slice(); //This gives me copy of tags array instead of pointing to array, needed for update process
    //If tag exists in array don't add it
    if (newTags.includes(tag)) { return }
    //Some additional processing for checking exclusive tags
    newTags.push(tag);

    let par = generateSearchURL(newTags, 1)
    navigateTo(par)
  }

  function removeTag(tag) {
    console.log('removing')
    console.log(tags)
    let i = tags.indexOf(tag);
    let afterRemove = tags.slice();
    afterRemove.splice(i, 1);
    console.log('after remove')
    console.log(afterRemove)

    let par = generateSearchURL(afterRemove, 1)
    navigateTo(par)
  }

  function generateSearchURL(tags, page) {
    let parameters = new URLSearchParams({
      page: page
    })
    for (let el in tags) {
      if (Array.isArray(tags[el])) {
        let tagString = ''
        for (let innerEl in tags[el]) {
          tagString += tags[el][innerEl] + ' OR '
        }
        tagString = tagString.slice(0, -4)
        parameters.append('tags', tagString)
      }
      else {
        parameters.append('tags', tags[el])
      }
    }
    return parameters
  }

  function getContentStyle(width) {
    const contentStyle = {
      display: "grid",
      height: 'fit-content',
      gridTemplateColumns: 'minmax(auto,1fr) minmax(auto,5fr)',
      margin:'0px 0px 0px 0px'
    }

    //console.log(width)
    if (width <= 450) {
      console.log('mobile')
      return {
        display: 'flex',
        width: 'fit-content'
      }
    }
    

    //console.log('desktop')
    return contentStyle
  }

  
  //Don't display those namespaces in tag list, eventually to move this into a setting
  const tagBlacklist = ['filename', 'title', 'page', 'group-title', 'doujin-title', 'kemono-title', 'pixiv-title', 'last', 'slast']

  return <>
    <SearchTags groupAction={changeGrouping} addTag={addTag} tags={tags} removeTag={removeTag} />
    <div style={getContentStyle(width)}>
      {(fileTags != undefined) && <TagList tags={fileTags} blacklist={tagBlacklist} scrollable={true} clickFunction={addTag} />}
      <ImageWall grouping={groupFiles} addTag={addTag} type={props.type} page={params.page} hashes={hashes} changePage={changePage} />
    </div>
  </>;
}
