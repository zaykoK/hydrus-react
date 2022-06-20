import * as React from 'react';
import * as API from './hydrus-backend';
import { useNavigate } from "react-router-dom";
import * as TagTools from './TagTools'
import colors from './stylingVariables';
import WidgetCount from './WidgetCount';
import WidgetFileType from './WidgetFileType';

// @ts-check

interface ImageThumbnailProps {
  hash: string;
  currentImage?: boolean;
  loadMeta: boolean;
  addTag: Function;
  replace: boolean;
  type:string;
  count?:number;
}


export const ImageThumbnail = React.memo((props: ImageThumbnailProps) => {
  const [thumbnail, setThumbnail] = React.useState(API.api_get_file_thumbnail_address(props.hash));
  const [metadata, setMetadata] = React.useState();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const navigate = useNavigate();


  const ThumbnailCommon = {
    padding: '0px',
    verticalAlign: 'bottom',
    objectFit: 'cover',
    background: colors.COLOR2,
    cursor: 'pointer'
  } as React.CSSProperties

  const WrapperStyleCommon = {
    position: 'relative',
    background: colors.COLOR2,
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0px 0px 5px 0px black',
    height: '180px',
    width: '180px',
    maxHeight: '43vw',
    maxWidth: '43vw',

  } as React.CSSProperties

  const ThumbnailStyle = {
    ...ThumbnailCommon,
    width: '100%',
    height: '100%',
  } as React.CSSProperties

  const ThumbnailStyleComic = {
    ...ThumbnailCommon,
    width: '250px',
    height: '370px',
  } as React.CSSProperties

  const wrapperStyle = {
    ...WrapperStyleCommon,
  } as React.CSSProperties

  const wrapperStyleComic = {
    ...WrapperStyleCommon,
    width: '250px',
    height: '370px',
  } as React.CSSProperties

  const metaStyle = {
    color: "white",
    position: "absolute",
    top: '0px',
    background: '#000000d1',
    margin: '0px',
    width: '100%',
    textAlign: 'center',
    fontSize: '1em'
  } as React.CSSProperties

  const metaStyleBottom = {
    color: "white",
    position: "absolute",
    bottom: '-2px',
    background: '#000000a1',
    margin: '0px',
    width: '100%',
    textAlign: 'center'
  } as React.CSSProperties

  function createTagPreview(args: { metadata: API.MetadataResponse|undefined, spaces: Array<string> }) {
    if (args.metadata != null) {
      return createTagList({ metadata: args.metadata, spaces: args.spaces });
    }
    return "";
  }

  function returnThumbStyle(type: string):Array<React.CSSProperties> {
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

  function createTagList(args: { metadata: API.MetadataResponse, spaces: Array<string> }) {
    if (args.metadata != null) {
      let index = sessionStorage.getItem('hydrus-all-known-tags')
      if (!index) { return }

      let tags = args.metadata.service_keys_to_statuses_to_display_tags[index][0];

      let tagsSorted = TagTools.transformIntoTuple(TagTools.tagArrayToMap(tags))
      let tagArrays = []
      for (let space in args.spaces) {
        let t = tagsSorted.filter((element) => element["namespace"] === args.spaces[space])
        let innerArray = []
        for (let element in t) {
          let tagStyle = TagTools.getTagTextStyle(t[element].namespace)
          if ( parseInt(element) != t.length) {
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

  async function GrabMetadata(hash: string) {
    let responseMeta = await API.api_get_file_metadata({ hash: hash, hide_service_names_tags: true })
    if (!responseMeta) {return}
    let meta = responseMeta.data.metadata[0]

    setMetadata(meta)
  }

  React.useEffect(() => {
    if (metadata == undefined && props.loadMeta) {
      GrabMetadata(props.hash);
    }
  }, []);

  function returnFileLink() {
    return "/file/" + props.hash
  }

  function ThumbContent(props: { thumbnail: string|undefined, type: string, hash: string, replace: boolean }) {

    function determineThumbNavigation(replace: boolean) {
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
  const thumbnailBottomTags: Array<string> = []

  return (
    <div className='Thumbnail'
      key={"thumb-" + props.hash}
      style={returnThumbStyle(props.type)[1]}
      onMouseOver={mouseEnterHandler}
      onMouseOut={mouseLeaveHandler}>
      <div className='topTags' style={metaStyle}>
        {isExpanded && (createTagPreview({ metadata: metadata, spaces: thumbnailTopTags }))}
      </div>
      <div className='bottomTags' style={metaStyleBottom}>
        <WidgetCount count={props.count} />
        <WidgetFileType metadata={metadata} />
        {isExpanded && (createTagPreview({ metadata: metadata, spaces: thumbnailBottomTags }))}
      </div>
      <ThumbContent
        type={props.type}
        replace={props.replace}
        thumbnail={thumbnail}
        hash={props.hash}
      />
    </div>
  );
});

export const MemoThumbnail = React.memo(ImageThumbnail);