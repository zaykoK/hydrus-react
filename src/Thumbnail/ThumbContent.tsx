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
}

function returnFilePageURL(hash: string, urlParameters: string | undefined, type: string) {
    let params = readParams(urlParameters)
    let url = generateSearchURL(params.tags, parseInt(params.page), hash, type)
  
    return "/search/" + url
  }

function ThumbContent(props: ThumbContentProps) {
    let { parm } = useParams<string>()


    function determineThumbNavigation(replace: boolean) {
        props.navigate(returnFilePageURL(props.hash, parm, props.type), { replace: replace })
    }

    function getThumbStyle(type: string): string {
        let style = 'thumbnail'
        //console.log(type)
        switch (type) {
            case 'comic':
                style += " thumbnailComic"
            default: //case 'image':
                style += " thumbnailImage"
                if (props.currentImage !== undefined && props.currentImage === false) {
                    style += " inactiveThumbnail"
                }
        }
        return style
    }

    return <img
        className={getThumbStyle(props.type)}
        onContextMenu={(e) => e.preventDefault()}
        onClick={() => { determineThumbNavigation(props.replace) }}
        loading='lazy'
        src={props.thumbnail}
        alt={props.hash} />
}
export default ThumbContent