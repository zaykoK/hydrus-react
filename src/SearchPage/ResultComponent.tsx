import { Fragment, useEffect, useState } from "react";
import { NavigateFunction, useParams } from "react-router-dom";
import { isMobile } from "../styleUtils";
import { ResultGroup } from "./ResultGroup";
import { MemoThumbnail as ImageThumbnail } from '../Thumbnail/ImageThumbnail';

import { readParams } from "../SearchPage/URLParametersHelpers";
import { createListOfUniqueTags, generateSearchURL, getAllTagsServiceKey, loadServiceData } from "../SearchPage/SearchPageHelpers";

import './ResultComponent.css'
import { ResultListElement, SelectedResult, SelectionVariables } from "./ImageWall";
import { getTagsFromMetadata } from "../hydrus-backend";
import * as API from '../hydrus-backend'
import { APIResponseGetService, APIResponseMetadata, MetadataResponse } from "../MetadataResponse";
import { CacheAxiosResponse } from "axios-cache-interceptor/dist/cache/axios.js";

import * as TagTools from '../TagTools'
import ContextMenu from "../ContextMenu";
import { createPortal } from "react-dom";
import ResultDetails, { isMyTitleScheme } from "./ResultDetails";
import { getGroupName } from "./GroupingFunctions";
import GroupingWindow from "./GroupingWindow";

interface ResultComponentProps {
    navigate: NavigateFunction;
    result: ResultGroup;
    type: string;
    grouping: boolean;
    selectionVariables: SelectionVariables
}

/* TESTING */
export class MediaSelection {
    selectedElements: Array<SelectedResult>
    static instance: MediaSelection | null = null
    constructor() {
        if (MediaSelection.instance) {
            return MediaSelection.instance
        }
        this.selectedElements = []

        MediaSelection.instance = this

    }

    addElements(elements: Array<SelectedResult>): void {
        this.selectedElements.push(...elements)
    }

    getElements(): Array<SelectedResult> {
        return this.selectedElements
    }

}

function returnFilePageURL(hash: string, urlParameters: string | undefined, type: string) {
    let params = readParams(urlParameters)
    let url = generateSearchURL(params.tags, parseInt(params.page), hash, type)

    return "/search/" + url
}


function ResultComponent(props: ResultComponentProps) {
    const [thumblist, setThumblist] = useState<Array<JSX.Element>>([])
    const [scrollable, setScrollable] = useState<boolean>(false)
    const [cover, setCover] = useState<JSX.Element | null>(null)

    const [isActive, setIsActive] = useState<boolean>(false)
    const [isShowingDetails, setIsShowingDetails] = useState<boolean>(false)


    const [groupingWindowVisible, setGroupingWindowVisible] = useState<boolean>(false)
    const [groupingObject, setGroupingObject] = useState<{
        proposedTitle: string;
        dates: {key:string,value:number}[] | undefined,
        creators: TagTools.Tuple[] | undefined,
        titles: TagTools.Tuple[] | undefined
    } | null>(null)

    const [contextVisible, setContextVisible] = useState<boolean>(false)
    const [contextCoordinates, setContextCoordinates] = useState<{ x: number, y: number }>({ x: 0, y: 0 })

    let { currentURLParameters } = useParams<string>()

    function determineThumbNavigation(hash: string, replace: boolean) {
        props.navigate(returnFilePageURL(hash, currentURLParameters, 'image'), { replace: replace })

    }

    function processSubgroups(result: ResultGroup) {
        let tempThumbs: Array<JSX.Element> = []
        // Sort subgroups in alphabetical order
        let sortedList = [...result.subgroups.values()].sort((a, b) => a.title.localeCompare(b.title))
        // Set a group cover to a first subgroup cover
        result.cover = sortedList[0].cover

        for (let subgroup of sortedList) {
            subgroup.entries.sort((a,b) => a.time_modified_details['local'] - b.time_modified_details['local'] )
            subgroup.cover = subgroup.entries[0].hash

            for (let subgroupEntry of subgroup.entries) {
                let thumb = <ImageThumbnail
                navigate={props.navigate}
                loadMeta={false}
                type={props.type}
                key={subgroupEntry.hash}
                hash={subgroupEntry.hash}
                replace={false}
                metadata={[subgroupEntry]}
                size={4}
                hideWidgetCount={true}
                disableLink={false}
            />
            tempThumbs.push(thumb)
            }
        }

        const coverElement = []

        const MAXITERATIONS = 4
        let iteration = 0
        for (let subgroup of sortedList) {
            if (iteration < MAXITERATIONS)
            coverElement.push(<ImageThumbnail
                navigate={props.navigate}
                loadMeta={false}
                type={props.type}
                key={subgroup.cover}
                hash={subgroup.cover}
                replace={false}
                metadata={subgroup.entries}
                size={4}
                hideWidgetCount={true}
                disableLink={true}
            />)
            iteration += 1
        }

        /* let delay = `${(Math.random()*5).toString()}s` */

        setCover(<ImageThumbnail
            navigate={props.navigate}
            loadMeta={false}
            type={props.type}
            key={result.cover}
            hash={result.cover}
            replace={false}
            metadata={result.entries}
            size={4}
            hideWidgetCount={false}
            disableLink={true}
        />)
        setCover(<div /* style={{animationDelay:delay}} */ className={getCoverElementsStyle(coverElement.length)}>{coverElement}</div>)
        return tempThumbs
    }

    function getCoverElementsStyle(length:number):string {
        let style = 'coverElements'
        if (length === 2) {
            style += ' duo'
        }
        if (length === 3) {
            style += ' trio'
        }
        if (length >= 4) {
            style += ' four'
            //style += ' four alternative'
        }
        return style
    }

    function processFlat(result: ResultGroup) {
        let tempThumbs: Array<JSX.Element> = []
        let entries = result.entries
        let sortedEntries = entries.sort((a, b) => a.time_modified_details['local'] - b.time_modified_details['local'])
        result.cover = sortedEntries[0].hash
        for (let entry of sortedEntries) {
            let thumb = <ImageThumbnail
                navigate={props.navigate}
                loadMeta={false}
                type={props.type}
                key={entry.hash + result.title}
                hash={entry.hash}
                replace={false}
                metadata={[entry]}
                size={4}
                hideWidgetCount={false}
                disableLink={false}
            />
            tempThumbs.push(thumb)
            setCover(<ImageThumbnail
                navigate={props.navigate}
                loadMeta={false}
                type={props.type}
                key={result.cover + result.title}
                hash={result.cover}
                replace={false}
                metadata={result.entries}
                size={4}
                hideWidgetCount={false}
                disableLink={true}
            />)
        }
        return tempThumbs
    }

    useEffect(() => {
        props.selectionVariables.allElements.push({ result: props.result, deactivateFunction: deactivate, activateFunction: activate })
        let tempThumbs: Array<JSX.Element> = []
        // If subgroups exist display subgroups
        let tLength = props.result.subgroups.size
        if (tLength > 0) {
            tempThumbs = processSubgroups(props.result)
        }
        else {
            tempThumbs = processFlat(props.result)
            // Change to random cover picture, WIP
            //setInterval(() => {setCover(tempThumbs[Math.floor(Math.random() * tempThumbs.length)])},3500)
        }
        setThumblist(tempThumbs)

    }, [])


    function getComponentStyle(size: number): string {
        let style = 'ResultComponent'
        if (isMobile()) {
            style += ' mobile'
        }
        if (size > 1) {
            style += ' bigger'
        }
        if (props.result.type === 'comic') {
            style += ' comic'
        }
        if (isActive) style += ' active'
        return style
    }
    function getWrapperComponentStyle(size: number, scrollable: boolean) {
        let style = "ResultComponentWrapper"
        if (isMobile()) {
            style += ' mobile'
        }
        if (scrollable) {
            style += ' scrollable'
        }
        if (size > 1) {
            style += ' bigger'
        }
        if (props.result.type === 'comic') {
            style += ' comic'
        }
        return style
    }

    function getTopText(): string {
        if (props.result.title !== props.result.cover) {
            return isMyTitleScheme(props.result.title)
        }
        return ''
    }
    function getResultCount(): string {
        if (thumblist.length > 1) {
            return thumblist.length.toString()
        }
        return ''

    }

    function getCoverStyle(): string {
        let style = 'ResultComponentCover'
        if (scrollable) {
            style += ' hidden'
        }
        if (isMobile()) {
            style += ' mobile'
        }
        return style
    }
    function getCoverTopbarStyle(): string {
        let style = 'ResultComponentTopBar'
        if (isMobile()) {
            style += ' mobile'
        }
        return style
    }
    function getResultCountStyle(): string {
        let style = 'ResultComponentCountWidget'
        if (isMobile()) {
            style += ' mobile'
        }
        return style
    }

    function toggleDetails() {
        if (isShowingDetails) setIsShowingDetails(false)
        else setIsShowingDetails(true)
    }

    function deactivate() {
        setIsActive(false)
        //console.log(`deactivate ${props.result.cover}`)
    }

    function activate(keepOther: boolean = false, shiftClick: boolean = false) {
        const allElements = props.selectionVariables.allElements
        const selectedItems = props.selectionVariables.selectedItems

        if (shiftClick) {
            //console.log('Processing shift click')
            const indexLast = allElements.findIndex(entry => { return entry.result.cover === props.selectionVariables.lastSelected })
            const indexCurrent = allElements.findIndex(entry => { return entry.result.cover === props.result.cover })

            const firstElement = Math.min(indexLast, indexCurrent)
            const lastElement = Math.max(indexLast, indexCurrent)

            const selectedElements = allElements.slice(firstElement, lastElement + 1)
            //console.log(selectedElements)
            //console.log(props.selectionVariables.selectedItems.length)

            // So this is buggy
            // As what this does is it takes all the elements between the ones you clicked and essentialy ctrl clicks them for you
            // This includes the 2 elements that were clicked before as in first and last element
            // What this means is it toggles one of them off
            // I have a brainfart and can't figure it out rn

            const lastClicked = props.selectionVariables.lastSelected

            for (let entry of selectedElements) {
                if (entry.result.cover === lastClicked) {
                    //console.log(`Skipping ${entry.result.cover}`)
                }
                else {
                    entry.activateFunction(true)
                }

            }
            //createGroup()
        }

        if (keepOther) {
            //console.log('Processing ctrl click')
            const indexOfElement = props.selectionVariables.selectedItems.findIndex(entry => { return entry.hash === props.result.cover })
            const elementExistsInActiveArray = indexOfElement !== -1

            if (elementExistsInActiveArray) {
                selectedItems.splice(indexOfElement, 1)
                props.selectionVariables.lastSelected = props.result.cover
                setIsActive(false)
            }
            else {
                selectedItems.push({ hash: props.result.cover, result: props.result, returnFunction: deactivate })
                props.selectionVariables.lastSelected = props.result.cover
                setIsActive(true)
            }
        }
        else if (shiftClick) {

        }
        else {
            //console.log('Processing single click')
            for (let element of selectedItems) {
                element.returnFunction()
            }
            selectedItems.length = 0
            selectedItems.push({ hash: props.result.cover, result: props.result, returnFunction: deactivate })
            props.selectionVariables.lastSelected = props.result.cover
            setIsActive(true)
        }
    }

    async function createGroup() {
        // What I want to do Is get a set of tags from selected files and do something of a recommended group name
        const hashes: Array<string> = []
        for (let item of props.selectionVariables.selectedItems) {
            for (let entry of item.result.entries) {
                hashes.push(entry.hash)
                //console.log(getTagsFromMetadata(entry,'',loadServiceData()))
            }
        }
        let response: CacheAxiosResponse<APIResponseMetadata> | undefined = await API.api_get_file_metadata({ tag_services: ['all known tags'], only_file_tags: true, tags: ['creator:', 'group-title:', 'doujin-title:', 'post-date:'], hashes: hashes, abortController: undefined })

        if (response) {
            for (let metadataEntry of response?.data.metadata) {
                let map = getTagsFromMetadata(metadataEntry, '', loadServiceData())
                let filter = TagTools.tagArrayToMap(map.get(getAllTagsServiceKey()) || [])
                //console.log(filter)
            }

        }



    }

    function processClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.preventDefault()
        e.stopPropagation()
        //console.log(`Clicked ${props.result.title}`)
        if (isMobile()) {
            determineThumbNavigation(props.result.cover, false)
        }
        else {
            //console.log(e.ctrlKey)
            if (e.ctrlKey) {
                console.log('Ctrl Click')
                activate(true)
            }
            else if (e.shiftKey) {
                console.log('Shift Click')
                activate(false, true)
            }
            else {
                console.log('Normal Click')
                activate()
            }
        }
    }

    function processDoubleClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.preventDefault()
        if (isMobile()) {
            return
        }
        //console.log(`Double clicked ${props.result.title}`)
        if (e.ctrlKey) {
            return
        }
        else if (e.shiftKey) {
            return
        }
        else {
            determineThumbNavigation(props.result.cover, false)
        }

    }

    function getContextName(numberOfSelectedElements: number): string {
        let name = `Selected ${numberOfSelectedElements} elements`

        /* if (numberOfSelectedElements === 1) {
            // Name should be artist - series - character
            name = `Selecte`
        } */



        return name
    }

    //EXPERIMENTAL

    let proposedGroupObject = {}

    async function loadObjectProposed() {

    }

    function getResultType() {
        let type:number = 0 // 0 -image, 1 - video, 2 -other

        if (props.result.entries[0].duration != null) {
            return 'v'
        }
        else {
            return 'i'
        }
    }


    function testFunction() {
        const Selects = new MediaSelection()

        Selects.addElements(props.selectionVariables.selectedItems)
        console.log(Selects.getElements())


    }

    async function enableGroupingWindow() {
        let object = await getGroupName(props.selectionVariables.selectedItems)
        setGroupingObject(object)
        setGroupingWindowVisible(true)
    }

    return <Fragment><div
        className={getComponentStyle(thumblist.length)}
        onClick={(e) => { processClick(e) }}
        onDoubleClick={(e) => { processDoubleClick(e) }}
        onContextMenu={(e) => {
            
            if (isMobile()) {
                e.preventDefault()
                toggleDetails()
            }
            else {
                const clickedResultIsAlreadySelected = props.selectionVariables.selectedItems.findIndex((value) => {return value.hash === props.result.cover}) === -1
                if (clickedResultIsAlreadySelected) {
                    processClick(e)
                }
                /* if (props.selectionVariables.selectedItems.length === 0 || props.selectionVariables.selectedItems.length === 1) {

                } */

                setContextCoordinates({ x: e.clientX, y: e.clientY })
                setContextVisible(!contextVisible)
            }
        }}>
        {/* {(!isMobile()) ? <div className={getWrapperComponentStyle(thumblist.length, scrollable)}>{thumblist}</div> : null} */}
        {<div className={getCoverStyle()}>
            {(isMobile()) ? null : <div className={getCoverTopbarStyle()}>{getTopText()}</div>}
            {cover}
            <div className={getResultCountStyle()} onClick={(e) => {
                if (!isMobile()) {
                    e.stopPropagation()
                    toggleDetails()
                }
            }} >{getResultCount()}</div>
           {/*  <div className={"result-filetype"}>
                {getResultType()}
            </div> */}
        </div>}
    </div>
        {(isShowingDetails) ? <ResultDetails result={props.result} navigate={props.navigate} cover={cover} thumblist={thumblist} /> : null}
        {(contextVisible) ? createPortal(<ContextMenu
            coordinates={contextCoordinates}
            actions={[
                { action: () => { console.log(props.selectionVariables.selectedItems); setContextVisible(false) }, label: 'List Elements' },
                { action: () => { enableGroupingWindow(); setContextVisible(false) }, label: 'Group Elements' },
                { action: () => { testFunction(); setContextVisible(false) }, label: 'TEST' },
            ]}
            namespace={"group-title"}
            name={getContextName(props.selectionVariables.selectedItems.length)}
            autoclose={true}
            setVisible={setContextVisible} />, document.body) : null}
        {(groupingWindowVisible) ? createPortal(<GroupingWindow
            hashes={props.selectionVariables.selectedItems}
            proposedObject={groupingObject} exitFunction={() => {setGroupingWindowVisible(false)}} />, document.body) : null}
    </Fragment>
}



export default ResultComponent