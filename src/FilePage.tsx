import * as React from 'react';
import { FileContent } from './FileContent';
import { useParams } from 'react-router-dom';
import * as TagTools from './TagTools'
import { TagList } from './TagList'
import { FileMetaData } from './FileMetaData';
import * as API from './hydrus-backend';
import { RelatedFiles } from './RelatedFiles';
// @ts-ignore
import IconRelated from './assets/related.svg'
// @ts-ignore
import IconLeft from './assets/arrow-left.svg'
// @ts-ignore
import IconRight from './assets/arrow-right.svg'
import colors from './stylingVariables';
import { getRelatedVisibile, getRelatedNamespaces } from './StorageUtils';
import FullscreenButton from './FullscreenButton';
import { useNavigate } from "react-router-dom";

export function FilePage() {
  interface FilePageParams {
    hash:string | undefined;
  }

  const { fileHash } = useParams();

  const [metadata, setMetaData] = React.useState<API.MetadataResponse>();
  const [tags, setTags] = React.useState([]);
  const [relatedVisible, setRelateVisible] = React.useState(getRelatedVisibile())

  const [width, setWidth] = React.useState(window.innerWidth)

  const navigate = useNavigate()

  function getMobileStyle(width:number):boolean {
    if (width < 450) { return true }
    return false
  }

  function returnStyle(mobile:boolean):React.CSSProperties {
    const contentStyle = {
      display: "grid",
      gridTemplateColumns: 'minmax(auto,1fr) minmax(auto,5fr)'
    }

    if (mobile) {
      return {
        display: 'grid',
        gridTemplateColumns: 'auto',
        gridTemplateRows: 'auto auto auto'
      }
    }
    return contentStyle
  }


  //If file hash changes reload tags
  React.useEffect(() => {
    loadTags();
  }, [fileHash])

  function returnFileLink(hash:string):string {
    return "/file/" + hash
  }

  function PreviousImage():void {
    //Grab image list
    //Use SessionStorage?
    if (sessionStorage.getItem('group-hashes') === null) {return}
    // @ts-ignore
    let elementList = JSON.parse(sessionStorage.getItem('group-hashes'))
    //console.log(fileHash)
    let index = elementList.indexOf(fileHash)
    //console.log(index)
    //Move to next
    if (index-1 < 0) { return }
    navigate(returnFileLink(elementList[index-1]), { replace: true })
  }


  function NextImage():void {
    //Grab image list
    //Use SessionStorage?
    if (sessionStorage.getItem('group-hashes') === null) {return}
     // @ts-ignore
    let elementList = JSON.parse(sessionStorage.getItem('group-hashes'))
    //console.log(fileHash)
    let index = elementList.indexOf(fileHash)
    //console.log(index)
    //Move to next
    if (index+1 >= elementList.length) { return }
    navigate(returnFileLink(elementList[index+1]), { replace: true })
  }

  async function loadTags() {
    let response = await API.api_get_file_metadata({ hash: fileHash, hide_service_names_tags: true })
    if (!response) {return}
    let data:API.MetadataResponse = response.data.metadata[0]

    let allKnownTags = sessionStorage.getItem('hydrus-all-known-tags');
    if (!allKnownTags) {allKnownTags=''}

    let responseTags = data.service_keys_to_statuses_to_display_tags[allKnownTags][0]
    let tagTuples = TagTools.transformIntoTuple(TagTools.tagArrayToMap(responseTags))
     // @ts-ignore
    tagTuples = tagTuples.sort((a, b) => TagTools.compareNamespaces(a, b))
    //console.log(response.data.metadata[0])
    setMetaData(response.data.metadata[0])
     // @ts-ignore
    setTags(tagTuples)
  }

  function returnRelatedStyle(mobile:boolean):React.CSSProperties {
    if (mobile) {
      return {
        background: colors.COLOR2,
        padding: '5px',
        borderRadius: '10px',
        position: 'fixed',
        bottom: '0px',
        minHeight: '0',
        maxHeight: '27vh',
        width: '100vw',
        overflowY: 'auto',
        overflowX: 'auto',
        boxShadow: '0 0 5px 0 black',
        fontSize: '1em',
        zIndex: '30'
      }
    }
    return {
      background: colors.COLORRELATED,
      padding: '5px',
      borderRadius: '10px',
      position: 'fixed',
      right: '0px',
      top: '0px',
      height: '99vh',
      maxWidth: '27vh',
      overflowY: 'auto',
      overflowX: 'hidden',
      boxShadow: '0 0 5px 0 black',
      fontSize: '1em',
      zIndex: '30'
    }

  }

  function returnRelatedSwitchStyle(enabled:boolean) {
    if (enabled) { return TopBarButtonStyle }
    return { ...TopBarButtonStyle, opacity: '0.3' }
  }

  const TopBarButtonStyle = {
    height: '1.5em',
    width: '1.5em',
    background: colors.COLOR2,
    margin: '5px',
    padding: '5px',
    borderRadius: '10px',
    cursor: 'pointer',
    opacity: '0.7'
  }

  const barStyle = {
    position: 'fixed',
    top: '0px',
    display: 'flex',
    flexFlow: 'rows',
    fontSize: 'larger',
    background: colors.COLOR1,
    width: '100vw',
    height: '49px',
    boxShadow: '0 0 5px 0 black',
    zIndex: '1'
  } as React.CSSProperties;

  const barStylePadding = {
    height: '51px',
  }

  interface RelatedFilesListProps {
    fileHash:string|undefined;
    tags:Array<string>
  }

  function RelatedFilesList(props:RelatedFilesListProps) {
    if (!fileHash) {return}
    function returnTagsFromNamespace(tags:Array<string>, namespace:string) {
      //This function returns an array of joined tag strings from tuples
      //{namespace:'character',value:'uzumaki naruto'} => 'character:uzumaki naruto'

      if (tags === undefined) { return }
       // @ts-ignore
      let list:Array<TagTools.Tuple> = tags.filter((element) => element["namespace"] === namespace)

      let joined = []
      for (let tag in list) {
        joined.push(list[tag].namespace + ':' + list[tag].value) //It has to have namespace
      }
      return joined
    }


    let returned = []
    //if (props.metadata == undefined) { return returned }
    let spaces = getRelatedNamespaces()
    for (let element in spaces) {
      let newElement = <RelatedFiles
        id={'relatedElements' + element}
        currentHash={props.fileHash}
        key={spaces[element] + returnTagsFromNamespace(props.tags, spaces[element])}
        tags={returnTagsFromNamespace(props.tags, spaces[element])}
        space={spaces[element]}
        mobile={getMobileStyle(width)}
      />

      returned.push(newElement)
    }
    return returned
  }

  function getContentStyle(mobile:boolean) {
    if (mobile) {
      return {
        gridRow: '1',
        gridColumn: '1'
      }
    }
    return {
      gridRow: '1',
      gridColumn: '2'
    }
  }

  function switchRelatedVisible() {
    if (relatedVisible) {
      localStorage.setItem('related-visible', 'false')
      setRelateVisible(false)
      return
    }
    localStorage.setItem('related-visible', 'true')
    setRelateVisible(true)
  }



  return <>
    <div style={barStylePadding}></div>
    <div style={barStyle} >
      <div id='home-button-padding' style={TopBarButtonStyle} />
      <img src={IconRelated} style={returnRelatedSwitchStyle(relatedVisible)} onClick={() => { switchRelatedVisible() }} />
      <img src={IconLeft} style={returnRelatedSwitchStyle(relatedVisible)} onClick={() => { PreviousImage() }} />
      <img src={IconRight} style={returnRelatedSwitchStyle(relatedVisible)} onClick={() => { NextImage() }} />
      <div style={TopBarButtonStyle}><FullscreenButton /></div>

    </div>
    <div style={returnStyle(getMobileStyle(width))}>
      <div>

        {(tags != undefined) && <TagList tags={tags} blacklist={[]} visibleCount={false} mobile={getMobileStyle(width)} />}
        {(metadata != undefined) && <FileMetaData metadata={metadata} />}

      </div>
      <div
        style={getContentStyle(getMobileStyle(width))}
      >
        {(metadata != undefined) &&
          <FileContent
            hash={fileHash}
            type={metadata.mime}
            mobile={getMobileStyle(width)}
            previousImage={PreviousImage}
            nextImage={NextImage}
             />}
      </div>

      {(relatedVisible) && <div style={returnRelatedStyle(getMobileStyle(width))}>

        {RelatedFilesList({ fileHash: fileHash, tags: tags })} {/* has to be done this to prevent unnecessary refreshes of list when changing files */}
      </div>}
    </div>
  </>;
}