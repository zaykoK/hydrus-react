import { memo, useState } from "react";
import { NavigateFunction, useParams } from "react-router-dom"
import { generateSearchURL } from "../SearchPage/SearchPageHelpers";
import { readParams } from "../SearchPage/URLParametersHelpers";

import "./ThumbContent.css"

interface ThumbContentProps {
    thumbnail: string | undefined;
    type: string, hash: string;
    replace: boolean;
    currentImage?: boolean;
    navigate: NavigateFunction;
    disableLink?:boolean;
}

function returnFilePageURL(hash: string, urlParameters: string | undefined, type: string) {
    let params = readParams(urlParameters)
    let url = generateSearchURL(params.tags, parseInt(params.page), hash, type)
  
    return "/search/" + url
  }

function ThumbContent(props: ThumbContentProps) {
    let { currentURLParameters } = useParams<string>()
    const [loaded,setLoaded] = useState<boolean>(false)


    function determineThumbNavigation(replace: boolean) {
        const isAllowedToAnchor = !props.disableLink
        if (isAllowedToAnchor) {
            props.navigate(returnFilePageURL(props.hash, currentURLParameters, props.type), { replace: replace })
        }
        
    }

    function getThumbStyle(type: string): string {
        let style = 'thumbnail'
        //console.log(type)
        switch (type) {
            case 'comic':
                style += " thumbnailComic"
                break
            default: //case 'image':
                style += " thumbnailImage"
                if (props.currentImage !== undefined && props.currentImage === false) {
                    style += " inactiveThumbnail"
                }
        }
        if (loaded) {
            style += ' loaded'
        }
        return style
    }

    return <img
        draggable={false}
        className={getThumbStyle(props.type)}
        onContextMenu={(e) => e.preventDefault()}
        onClick={() => { determineThumbNavigation(props.replace) }}
        onLoad={() => { setLoaded(true) }}
        loading='lazy'
        src={props.thumbnail}
        alt={props.hash} />
}

export const MemoThumbContent = memo(ThumbContent)
export default ThumbContent