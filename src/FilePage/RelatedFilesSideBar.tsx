import { getRelatedNamespaces } from "../StorageUtils";
import { isLandscapeMode, isMobile } from "../styleUtils";
import { RelatedFiles } from "./RelatedFiles"

import './RelatedFilesSideBar.css'

interface RelatedFilesListProps {
    fileHash: string | undefined;
    tags: Array<string>
}

function RelatedFilesList(props: RelatedFilesListProps) {
    if (!props.fileHash) { return }
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

    let returned = []
    //if (props.metadata == undefined) { return returned }
    let spaces = getRelatedNamespaces()
    for (let element of spaces) {
        //If no tags in namespace, don't add to the list
        let tags = returnTagsFromNamespace(props.tags, element) || []
        if (tags?.length > 0) {
            let newElement =
                <RelatedFiles
                    id={'relatedElements' + element}
                    currentHash={props.fileHash}
                    key={element + returnTagsFromNamespace(props.tags, element)}
                    tags={tags}
                    space={element}
                    mobile={isMobile()}
                />
            returned.push(newElement)
        }
    }
    return returned
}

interface RelatedFilesSideBarProps {
    visible: boolean;
    fileHash: string|undefined;
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

    return <div className={getRelatedStyle(props.visible)}>
        {RelatedFilesList({ fileHash: props.fileHash, tags: props.tags })} {/* has to be done this to prevent unnecessary refreshes of list when changing files */}
    </div>
}

export default RelatedFilesSideBar