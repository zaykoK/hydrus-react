import { useEffect, useState } from "react";
import { getRelatedNamespaces } from "../StorageUtils";
import { isLandscapeMode, isMobile } from "../styleUtils";
import { relatedDataCartType } from "./FilePage";
import { RelatedFiles } from "./RelatedFiles"
import { getAllTagsServiceKey } from "../SearchPage/SearchPageHelpers"

import './RelatedFilesSideBar.css'

interface RelatedFilesListProps {
    relatedData: relatedDataCartType;
    landscape:boolean;
    type:string;
}

///TODO
// This thing essentialy recreates the list every single goddamn time anything changes, which is stupid and wasteful
// 


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

// TODO !
// Create group tabs


function RelatedFilesList(props: RelatedFilesListProps) {
    const [relatedList, setRelatedList] = useState<Array<JSX.Element>>([])

    //If group important tags are not changed do not refresh
    //Which is if between two files group-title tags are same don't do anything

    useEffect(() => {
        let dataTags = props.relatedData.tags
        let dataHash = props.relatedData.hash

        let returned: Array<JSX.Element> = []
        let returnedTags: Array<Array<string>> = []
        //if (props.metadata == undefined) { return returned }
        let spaces = getRelatedNamespaces()
        console.log(spaces)
        let i = 0
        let shouldBeExpanded = true

        for (let element of spaces) {
            //If no tags in namespace, don't add to the list
            //@ts-ignore
            let tags = returnTagsFromNamespace(dataTags.get(getAllTagsServiceKey()), element) || []
            console.log(tags)
            // Split subgroups and sort
            const SplitSymbol = '/'
            for (let groupTag of tags) {
                let splitted = groupTag.split(SplitSymbol)
                // Right now this just displays all images from each group, not just the subgroup

                let newElement = <RelatedFiles
                    id={'relatedElements' + element}
                    currentHash={dataHash}
                    key={element + groupTag}
                    tags={[splitted[0]+'/*']}
                    /* tags={[groupTag]} */
                    space={element}
                    initiallyExpanded={shouldBeExpanded}
                    landscape={props.landscape}
                    type={props.type}
                />
                shouldBeExpanded=false
            returned.push(newElement)
            returnedTags.push(tags)
            }
            //if (tags?.length > 0) { // && (JSON.stringify(currentTags[i]) !== JSON.stringify(tags))) {
                //console.log('had to update')
               
            //}
            i += 1
        }
        if (returned.length === 0) { sessionStorage.removeItem('group-hashes')}
        setRelatedList(returned)
    }, [props.relatedData])


    return <>{relatedList}</>
}

interface RelatedFilesSideBarProps {
    visible: boolean;
    relatedData: relatedDataCartType;
    landscape:boolean;
    type:string;
}

export function RelatedFilesSideBar(props: RelatedFilesSideBarProps) {
    function getRelatedStyle(visible: boolean,landscape:boolean): string {
        let className = 'relatedSidebar'
        if (isMobile()) {
            className += ' mobile'
            if (landscape) { className += ' landscape' }
        }
        if (!visible) { className += ' hidden' }
        return className
    }

    return <div className={getRelatedStyle(props.visible,props.landscape)}>
        <RelatedFilesList relatedData={props.relatedData} landscape={props.landscape} type={props.type} />
    </div>
}

export default RelatedFilesSideBar