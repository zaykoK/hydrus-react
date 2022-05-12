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
  const [lastSearch, setLastSearch] = useState()
  const [params, setParams] = useState({ tags: undefined, page: undefined })
  const [fileTags, setFileTags] = useState()
  const { parm } = useParams()

  const navigate = useNavigate();

  function refreshParams() {
    let [t, p] = readParams(parm)

    setPageTitle(t, p)
    setParams({ tags: t, page: p })
    setTags(t)

  }

  function groupImages() {
    //1.Get all searched tags metadata
    //2.Move all tags with same 

  }

  async function grabMetaData(){
    let step = 100
    let responses = []
    if (hashes.length > 0) {
      
      for (let i=0;i<Math.min(i+step,hashes.length);i+=step){
        let response = await API.api_get_file_metadata({hashes: hashes.slice(i,Math.min(i+step,hashes.length)), hide_service_names_tags: true})
        responses.push(response.data.metadata)
      }
      responses = responses.flat()
      //console.log(responses)
      
      joinMetaTags(responses)

    }
    //return responses
  }

  function joinMetaTags(responses) {
    console.time('metajoin')
    let merged = []
    //let setApproach = new Set()
    console.log(responses)
    for (let element in responses){
      merged.push(responses[element].service_keys_to_statuses_to_display_tags[sessionStorage.getItem('hydrus-all-known-tags')][0])
    }
    
    merged = TagTools.transformIntoTuple([...new Set(merged.flat())])
    //for (let item in merged){
    //  setApproach.add(merged[item])
    //}
    merged.sort((a, b) => TagTools.compareNamespaces(a, b))
    console.timeEnd('metajoin')
    console.log(merged)
    setFileTags(merged)
  }

  useEffect (() => {
    grabMetaData()
  },[hashes])

  function setPageTitle(tags, page) {
    if (tags.length === 0) {
      switch(props.type){
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
      switch(props.type){
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

  function returnComicNamespace(){
    if (localStorage.getItem('comic-namespace') != undefined) {
      return localStorage.getItem('comic-namespace')
    }
    else{
      return 'doujin-title'
    }
  }

  function setDefaultSearch() {
    switch (props.type){
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
    //pulls session key if abstinent
    //API.sessionKeyRoutine();
    let [t, p] = readParams(parm)

    setPageTitle(t, p)
    setParams({ tags: t, page: p })
    setTags(t)
  }, [])

  async function Search() {
    //If there is nothing to search for or search is identical to previous don't do anything
    if (tags === undefined || JSON.stringify(tags) === JSON.stringify(lastSearch)) { return }
    setLastSearch(tags.slice())

    let response = await API.api_get_files_search_files({ tags:tags, return_hashes: true, return_file_ids: false });
    setHashes(response.data.hashes)
  }

  function changePage(newPage) {
    let par = generateSearchURL(tags,newPage)
    navigateTo(par)
  }

  useEffect(() => {
    refreshParams()
  }, [parm])

  useEffect(() => {
    Search()
  }, [tags])

  function navigateTo(parameters){
    switch (props.type){
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

  const tagBlacklist = ['filename','title','page',,'doujin-title','kemono-title','pixiv-title','last','slast']

  return <>
    <div style={{ height: '36px' }}><TagDisplay key={tags} removeTag={removeTag} tags={tags} /></div>
    <SearchTags addTag={addTag} />
    <div style={contentStyle}>

      {(fileTags != undefined) &&<TagList tags={fileTags} blacklist={tagBlacklist} scrollable={true} clickFunction={addTag} />}
      <ImageWall addTag={addTag} type={props.type} page={params.page} hashes={hashes} changePage={changePage} />
    </div>
  </>;
}
