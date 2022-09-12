import { group } from "console";
import { useEffect, useState } from "react";
import { getRelatedNamespaces } from "../StorageUtils";
import { isLandscapeMode, isMobile } from "../styleUtils";
import { RelatedFiles } from "./RelatedFiles"

import './RelatedFilesSideBar.css'

interface RelatedFilesListProps {
    fileHash: string | undefined;
    tags: Array<string>
}

///TODO
// This thing essentialy recreates the list every single goddamn time anything changes, which is stupid and wasteful
// 

function RelatedFilesList(props: RelatedFilesListProps) {
    const [relatedList, setRelatedList] = useState<Array<JSX.Element>>([])

    const [currentTags, setCurrentTags] = useState<Array<Array<string>>>([])

    //if (!props.fileHash) { return <>{relatedList}</> }
    function returnTagsFromNamespace(tags: Array<string>, namespace: string) {
        //This function returns an array of joined tag strings from tuples
        //{namespace:'character',value:'uzumaki naruto'} => 'character:uzumaki naruto'
        if (tags === undefined) { return }
        // @ts-ignore
        let list: Array<TagTools.Tuple> = tags.filter((element) => element["namespace"] === namespace)
        let joined = []
        for (let tag in list) {
            joined.push(list[tag].namespace + ':' + list[tag].value) //It has to have namespace
        }
        return joined
    }

    //If group important tags are not changed do not refresh
    //Which is if between two files group-title tags are same don't do anything

    useEffect(() => {
        //if (JSON.stringify(props.tags))
        let shouldUpdate = true
        let groupTags:Array<Array<string>> = []

        let returned: Array<JSX.Element> = []
        //if (props.metadata == undefined) { return returned }
        let spaces = getRelatedNamespaces()
        let i = 0
        for (let element of spaces) {
            //If no tags in namespace, don't add to the list
            let tags = returnTagsFromNamespace(props.tags, element) || []
            //console.log(tags)
            groupTags.push(tags)
            if (tags?.length > 0) { // && (JSON.stringify(currentTags[i]) !== JSON.stringify(tags))) {
                //console.log('had to update')
                shouldUpdate = true
                let newElement =
                    <RelatedFiles
                        id={'relatedElements' + element}
                        currentHash={props.fileHash}
                        key={element + tags}
                        tags={tags}
                        space={element}
                    />
                returned.push(newElement)
            }
            i += 1
        }
        if (shouldUpdate) { setRelatedList(returned);setCurrentTags(groupTags) } 
    }, [props.tags])


    return <>{relatedList}</>
}

interface RelatedFilesSideBarProps {
    visible: boolean;
    fileHash: string | undefined;
    tags: Array<string>;
}

export function RelatedFilesSideBar(props: RelatedFilesSideBarProps) {
    function getRelatedStyle(visible: boolean): string {
        let className = 'relatedStyle'
        if (isMobile()) {
            className += ' mobile'
            if (isLandscapeMode()) { className += ' landscape' }
        }
        if (!visible) { className += ' hidden' }
        return className
    }

    console.log(props.tags)

    //{RelatedFilesList({ fileHash: props.fileHash, tags: props.tags })} {/* has to be done this to prevent unnecessary refreshes of list when changing files */}


    return <div className={getRelatedStyle(props.visible)}>
        <RelatedFilesList fileHash={props.fileHash} tags={props.tags} /> {/* has to be done this to prevent unnecessary refreshes of list when changing files */}
    </div>
}

export default RelatedFilesSideBar