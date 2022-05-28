import React, { useEffect, useState } from 'react';
import * as API from './hydrus-backend';
import { useNavigate } from "react-router-dom";
import * as TagTools from './TagTools'
import IconImage from './assets/filetype-picture.svg'
import IconVideo from './assets/filetype-video.svg'
import IconOther from './assets/filetype-unknown.svg'
import colors from './stylingVariables';

export const ImageThumbnail = React.memo((props) => {
  const [thumbnail, setThumbnail] = useState(API.api_get_file_thumbnail_address(props.hash));
  const [metadata, setMetadata] = useState();
  const [isExpanded, setIsExpanded] = useState(false);

  const navigate = useNavigate();

  const ThumbnailCommon = {
    padding: '0px',
    verticalAlign: 'bottom',
    objectFit: 'cover',
    background: colors.COLOR2,
    cursor: 'pointer'
  }

  const WrapperStyleCommon = {
    position: 'relative',
    background: colors.COLOR2,
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0px 0px 5px 0px black',
    height:'180px',
    width:'180px',
    maxHeight:'43vw',
    maxWidth:'43vw',

  }

  const ThumbnailStyle = {
    ...ThumbnailCommon,
    width: '100%',
    height: '100%',
  };

  const ThumbnailStyleComic = {
    ...ThumbnailCommon,
    width: '250px',
    height: '370px',
  };

  const wrapperStyle = {
    ...WrapperStyleCommon,
  }

  const wrapperStyleComic = {
    ...WrapperStyleCommon,
    width: '250px',
    height: '370px',
  }

  const metaStyle = {
    color: "white",
    position: "absolute",
    top: '0px',
    background: '#000000d1',
    margin: '0px',
    width: '100%',
    textAlign: 'center',
    fontSize: '1em'
  }

  const metaStyleBottom = {
    color: "white",
    position: "absolute",
    bottom: '-2px',
    background: '#000000a1',
    margin: '0px',
    width: '100%',
    textAlign: 'center'
  }

  function createTagPreview(args) {
    if (args.metadata != null) {
      return createTagList({ metadata: args.metadata, spaces: args.spaces });
    }
    return "";
  }

  function returnThumbStyle(type) {
    //console.log(type)
    switch (type) {
      case 'image':
        if (props.currentImage) {
          return [{ ...ThumbnailStyle, opacity: '0.3' }, wrapperStyle]
        }
        else {
          return [ThumbnailStyle, wrapperStyle]
        }
      case 'comic':
        return [ThumbnailStyleComic, wrapperStyleComic]
      default:
        if (props.currentImage) {
          return [{ ...ThumbnailStyle, opacity: '0.3' }, wrapperStyle]
        }
        else {
          return [ThumbnailStyle, wrapperStyle]
        }
    }
  }

  function createTagList(args) {
    if (args.metadata != null) {
      let tags = args.metadata.service_keys_to_statuses_to_display_tags[sessionStorage.getItem('hydrus-all-known-tags')][0];

      let tagsSorted = TagTools.transformIntoTuple(TagTools.tagArrayToMap(tags))
      let tagArrays = []
      for (let space in args.spaces) {
        let t = tagsSorted.filter((element) => element["namespace"] === args.spaces[space])
        let innerArray = []
        for (let element in t) {
          let tagStyle = TagTools.getTagTextStyle(t[element].namespace)
          if (element != t.length) {
            tagStyle = {
              ...tagStyle,
              paddingRight: '5px'
            }
          }
          innerArray.push(
            <span
              key={t[element].value}
              style={tagStyle}
              onClick={(() => { props.addTag(args.spaces[space] + ':' + t[element].value) })}
            >
              {t[element].value}
            </span>
          );
        }
        tagArrays.push(innerArray)
      }
      let finalString = []
      for (let space in tagArrays) {
        finalString.push(<p key={props.hash + args.spaces[space]} style={{ margin: '0px' }}>{tagArrays[space]}</p>)
      }
      return finalString;
    }
    return ''
  }

  function mouseEnterHandler() {
    setIsExpanded(true);
  }

  function mouseLeaveHandler() {
    setIsExpanded(false);
  }

  async function GrabMetadata(hash) {
    let responseMeta = await API.api_get_file_metadata({ hash: hash, hide_service_names_tags: true })
    let meta = responseMeta.data.metadata[0]

    setMetadata(meta)
  }

  useEffect(() => {
    if (metadata == undefined && props.loadMeta) {
      GrabMetadata(props.hash);
    }
  }, []);

  function returnFileLink() {
    return "/file/" + props.hash
  }

  function ThumbContent(props) {

    function determineThumbNavigation(replace) {
      navigate(returnFileLink(), { replace: replace })
    }

    return <img 
    onClick={() => { determineThumbNavigation(props.replace) }} 
    loading='lazy' 
    src={props.thumbnail} 
    style={returnThumbStyle(props.type)[0]} 
    alt={props.hash} />
  }

  const thumbnailTopTags = ['creator', 'series']
  const thumbnailBottomTags = []

  function ContentTypeIcon(props) {
    if (props === undefined) {return}

    let count = ''
    if (props.count != undefined) { count = props.count}

    const iconStyle = {
      position:'absolute',
      bottom:'0px',
      left:'0px',
      background:'#000000d1',
      padding:'3px',
      borderRadius:'0px 10px 0px 0px',
      opacity:'0.6'
    }
    const svgStyle = {
      width:'20px',
      height:'20px'
    }


    if (props.metadata?.mime.includes('video')){
      return <div style={iconStyle}>{count}<img src={IconVideo} style={svgStyle} /></div>
    }
    if (props.metadata?.mime.includes('image')){
      return <div style={iconStyle}>{count}<img src={IconImage} style={svgStyle} /></div>
    }
    if (props.metadata?.mime.includes('application')){
      return <div style={iconStyle}>{count}<img src={IconOther} style={svgStyle} /></div>
    }
    return <div style={iconStyle}>{count}<img src={IconImage} style={svgStyle} /></div>
  }


  return (
    <div className='Thumbnail' key={"thumb-" + props.hash} style={returnThumbStyle(props.type)[1]} onMouseOver={mouseEnterHandler} onMouseOut={mouseLeaveHandler}>
      <div className='topTags' style={metaStyle}>
        {isExpanded && (createTagPreview({ metadata: metadata, spaces: thumbnailTopTags }))}
      </div>
      <div className='bottomTags' style={metaStyleBottom}>
        <ContentTypeIcon metadata={metadata} count={props.count} />
        {isExpanded && (createTagPreview({ metadata: metadata, spaces: thumbnailBottomTags }))}
      </div>
      <ThumbContent
        type={props.type}
        replace={props.replace}
        thumbnail={thumbnail}
         />
    </div>
  );
});

export const MemoThumbnail = React.memo(ImageThumbnail);