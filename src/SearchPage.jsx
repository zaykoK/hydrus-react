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

    let tMap = new Map()
    for (let element in responses) {
      let filterTags = TagTools.transformIntoTuple(responses[element].service_keys_to_statuses_to_display_tags[sessionStorage.getItem('hydrus-all-known-tags')][0]).filter((element) => element["namespace"] === groupNamespace)
      if (filterTags.length !== 0) {
        tMap.set(
          responses[element].hash,
          filterTags
        )
      }
    }
    let hMap = new Map()
    tMap.forEach((value, key, map) => {
      let groupTitle = value[0].value
      if (hMap.has(groupTitle)) {
        let v = hMap.get(groupTitle)
        hMap.set(groupTitle, [...v, key])
      }
      else {
        hMap.set(groupTitle, [key])
      }
    })
    let hashesCopy = hashes.slice()

    hMap.forEach((value, key, map) => {
      for (let v in value.slice(1)) {
        hashesCopy.splice(hashesCopy.indexOf(value[v]), 1)
      }
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


      joinMetaTags(responses)
      let h = hashes
      if (groupFiles == true) { h = groupImages(responses, hashes, getGroupNamespace()) }

      setHashes(h)

    }
  }

  function joinMetaTags(responses) {
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
    let i = tags.indexOf(tag);
    let afterRemove = tags.slice();
    afterRemove.splice(i, 1);

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

  const contentStyle = {
    display: "grid",
    height: 'fit-content',
    gridTemplateColumns: 'minmax(auto,1fr) minmax(auto,5fr)'
  }

  const tagBlacklist = ['filename', 'title', 'page', 'group-title', 'doujin-title', 'kemono-title', 'pixiv-title', 'last', 'slast']

  return <>
    <div style={{ height: '36px' }}><TagDisplay key={tags} removeTag={removeTag} tags={tags} /></div>
    <SearchTags groupAction={changeGrouping} addTag={addTag} />
    <div style={contentStyle}>

      {(fileTags != undefined) && <TagList tags={fileTags} blacklist={tagBlacklist} scrollable={true} clickFunction={addTag} />}
      <ImageWall grouping={groupFiles} addTag={addTag} type={props.type} page={params.page} hashes={hashes} changePage={changePage} />
    </div>
  </>;
}
