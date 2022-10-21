import { NavigateFunction } from "react-router-dom";
import WidgetCountTag from "./WidgetCountTag";
import * as API from '../hydrus-backend';
import * as TagTools from '../TagTools'
import { isMobile } from "../styleUtils";
import TagLink from './TagLink';
import { createTagPreview, getComicTitle } from "./ImageThumbnail";
import { getComicNamespace } from "../StorageUtils";
import ThumbContent from "./ThumbContent";

import './ResultComicCard.css'

interface ResultComicCardProps {
    metadata: API.MetadataResponse | undefined;
    navigate: NavigateFunction;
    type: string;
    replace: boolean;
    thumbnail: string;
    hash: string;
    metadataGroup: Array<TagTools.Tuple>;
}


function createTagPreviewFromGroup(args: { metadataGroup: Array<TagTools.Tuple>, spaces: Array<string>, limit?: number, navigate: NavigateFunction, type: string, hash: string }) {
    if (args.metadataGroup !== undefined) {
        let limit = 20
        if (args.limit) { limit = args.limit }

        let tagArrays = []
        for (let space in args.spaces) {
            //Filter the tags that match the space
            let tags = args.metadataGroup.filter((element) => element["namespace"] === args.spaces[space])
            //Display the tags
            let innerArray = []
            let limitCount = 0

            //Sort the tags by the order of count
            tags.sort((a, b) => { return b.count - a.count })

            for (let tag in tags) {
                let tagStyle = TagTools.getTagTextStyle(tags[tag].namespace)

                //If tag limit reach stop adding new ones
                //THIS IS EXPERIMENTAL
                if (limitCount === limit) { break }

                if (parseInt(tag) !== tags.length) {
                    tagStyle = {
                        ...tagStyle,
                        marginRight: '0.5em',
                        cursor: 'pointer',
                    }
                }
                innerArray.push(TagLink({ style: tagStyle, tag: tags[tag].value, namespace: tags[tag].namespace, navigate: args.navigate, type: args.type }))
                limitCount += 1
            }
            tagArrays.push(innerArray)
        }
        let finalString = []
        for (let space in tagArrays) {
            if (args.type === 'comic') {
                finalString.push(<p onContextMenu={(e) => e.preventDefault()} key={args.hash + args.spaces[space]} style={{ margin: '0px', overflow: 'hidden', display: 'flex', flexWrap: 'wrap' }}>{tagArrays[space]}</p>)
            }
            else {
                finalString.push(<p onContextMenu={(e) => e.preventDefault()} key={args.hash + args.spaces[space]} style={{ margin: '0px' }}>{tagArrays[space]}</p>)
            }

        }
        return finalString;
    }
    return ''
}


function ResultComicCard(props: ResultComicCardProps) {
    function getComponentStyle(style: string) {
        let returnStyle = style
        if (isMobile()) { returnStyle += ' mobile' }
        return returnStyle
    }

    return <div className={getComponentStyle('comicCard')}>
        <div className={getComponentStyle('comicCardTitle')}>
            {getComicTitle(props.metadata, getComicNamespace(), true)}
        </div>
        <div className={getComponentStyle('comicCardContent')}>
            <div className={getComponentStyle('comicCardThumbnailRow')}>
                <ThumbContent
                    navigate={props.navigate}
                    type={props.type}
                    replace={props.replace}
                    thumbnail={props.thumbnail}
                    hash={props.hash}
                />
                <div className={getComponentStyle('comicCardThumbnailRowMetadata')}>
                    {createTagPreview({
                        metadata: props.metadata, spaces: ['language'],
                        type: props.type,
                        hash: props.hash,
                        navigate: props.navigate
                    })}
                </div>

            </div>
            <div className={getComponentStyle('comicCardMetadataRow')}>

                {createTagPreviewFromGroup({
                    metadataGroup: props.metadataGroup, spaces: ['creator', 'circle', 'series'],
                    navigate: props.navigate,
                    type: props.type,
                    hash: props.hash
                })}

                <div style={{ fontSize: 'small' }}>
                    {createTagPreviewFromGroup({
                        metadataGroup: props.metadataGroup, spaces: ['chapter', 'volume'],
                        navigate: props.navigate,
                        type: props.type,
                        hash: props.hash
                    })}
                </div>
                <WidgetCountTag tag={getComicTitle(props.metadata, getComicNamespace(), false)} />
                {/* TODO Those tags should be limited to something like max 15-20 tags, and selection of which should be done by counting all tags on files in the collection (assuming that separate file tags differ from each other) and showing essentialy the 15-20 that happen most across all files in collection. Other solution is to use separate tag repository for group tags. Or keep as is and force users to tag 0/1st page with the correct comic tags OR maybe just maybe hydrus-dev will deliever nice support for image groups and this will be a single API call... ahh dreams. */}
                <div style={{ fontSize: 'small' }}>
                    {createTagPreviewFromGroup({
                        metadataGroup: props.metadataGroup, spaces: ['', 'gender', 'character'],
                        navigate: props.navigate,
                        type: props.type,
                        hash: props.hash
                    })}
                </div>
            </div>
        </div>
    </div>
}
export default ResultComicCard