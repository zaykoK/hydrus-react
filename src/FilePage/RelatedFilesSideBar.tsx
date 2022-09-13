import { useEffect, useState } from "react";
import { getRelatedNamespaces } from "../StorageUtils";
import { isLandscapeMode, isMobile } from "../styleUtils";
import { relatedDataCartType } from "./FilePage";
import { RelatedFiles } from "./RelatedFiles"

import './RelatedFilesSideBar.css'

interface RelatedFilesListProps {
    relatedData: relatedDataCartType;

}

///TODO
// This thing essentialy recreates the list every single goddamn time anything changes, which is stupid and wasteful
// 

function RelatedFilesList(props: RelatedFilesListProps) {
    const [relatedList, setRelatedList] = useState<Array<JSX.Element>>([])
    const [relatedListTags, setRelatedListTags] = useState<Array<Array<string>>>([])

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
        let dataTags = props.relatedData.tags
        let dataHash = props.relatedData.hash

        //if (JSON.stringify(props.tags))
        let shouldUpdate = true
        let groupTags: Array<Array<string>> = []

        let returned: Array<JSX.Element> = []
        let returnedTags: Array<Array<string>> = []
        //if (props.metadata == undefined) { return returned }
        let spaces = getRelatedNamespaces()
        let i = 0
        for (let element of spaces) {
            //If no tags in namespace, don't add to the list
            //@ts-ignore
            let tags = returnTagsFromNamespace(dataTags, element) || []
            //console.log(tags)
            groupTags.push(tags)
            if (tags?.length > 0) { // && (JSON.stringify(currentTags[i]) !== JSON.stringify(tags))) {
                //console.log('had to update')
                shouldUpdate = true
                let newElement =
                    <RelatedFiles
                        id={'relatedElements' + element}
                        currentHash={dataHash}
                        key={element + tags}
                        tags={tags}
                        space={element}
                    />
                returned.push(newElement)
                returnedTags.push(tags)
            }
            i += 1
        }
        //if (JSON.stringify(relatedListTags) === JSON.stringify(returnedTags)) { shouldUpdate = false }
        if (shouldUpdate) { setRelatedList(returned); setRelatedListTags(returnedTags) }
    }, [props.relatedData])


    return <>{relatedList}</>
}

interface RelatedFilesSideBarProps {
    visible: boolean;
    relatedData: relatedDataCartType;
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

    //console.log(props.tags)

    //{RelatedFilesList({ fileHash: props.fileHash, tags: props.tags })} {/* has to be done this to prevent unnecessary refreshes of list when changing files */}


    return <div className={getRelatedStyle(props.visible)}>
        <RelatedFilesList relatedData={props.relatedData} /> {/* has to be done this to prevent unnecessary refreshes of list when changing files */}
    </div>
}

export default RelatedFilesSideBar