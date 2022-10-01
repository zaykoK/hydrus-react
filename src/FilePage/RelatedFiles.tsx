import * as API from '../hydrus-backend';
import { MemoThumbnail as ImageThumbnail } from '../Thumbnail/ImageThumbnail';
import { useEffect, useRef, useState } from 'react';
import { tagArrayToNestedArray } from '../TagTools';

import "./RelatedFiles.css"
import { isLandscapeMode, isMobile } from '../styleUtils';
import * as TagTools from '../TagTools'
import { NavigateFunction, useNavigate } from 'react-router-dom';

interface RelatedFilesProps {
    tags: Array<string> | undefined; //Nested array only for searching
    currentHash: string | undefined;
    id: string;
    space: string;
    initiallyExpanded: boolean;
    landscape: boolean;
}

function emptyFunction() {

}

export function RelatedFiles(props: RelatedFilesProps) {
    const [relatedHashes, setRelatedHashes] = useState<Array<string>>([])
    const [thumbs, setThumbs] = useState<Array<JSX.Element>>([])
    const [scrollOffset, setScrollOffset] = useState<number>(0)
    const [currentTags, setCurrentTags] = useState<Array<string>>([])
    const [expanded, setExpanded] = useState<boolean>(props.initiallyExpanded)

    const AbortControllerSearch = useRef<AbortController | undefined>()
    const AbortControllerMetadata = useRef<AbortController | undefined>()


    /*
        Since it's impossible to declare navigate outside of component, navigate object gets "re-created" every time component re-renders
        this means that every it happens all the children get a new prop that change that also facilitates a re-render on them
        based on the fact that this works I'm potentialy saving some 10-300ms on re-render whenever changing to new image
        using useRef means object gets created once and only changes whenever i actually change navigate.current or (maybe) redeclare a new useRef
        Seems to potentialy be the same thing as
        const [navigate,setNavigate] = useState<NavigateFunction>(useNavigate())
    */

    const navigate = useRef(useNavigate())

    useEffect(() => {
        async function Search() {
            //console.log('settings new group hashes to storage')
            //console.log(props.tags)
            if (AbortControllerSearch.current) {
                AbortControllerSearch.current.abort()
            }
            if (AbortControllerMetadata.current) {
                AbortControllerMetadata.current.abort()
            }
            AbortControllerSearch.current = new AbortController()
            AbortControllerMetadata.current = new AbortController()


            if (props.tags === undefined) { return }
            let list = props.tags
            if (list.length === 0 || list === undefined) {
                setRelatedHashes(list)
                sessionStorage.setItem('group-hashes', JSON.stringify([props.currentHash]))
                return
            }
            //Get file hashes
            let response = await API.api_get_files_search_files({ tags: tagArrayToNestedArray(list), return_hashes: true, return_file_ids: false, abortController: AbortControllerSearch.current }).catch((reason) => { return })
            if (!response) { return }
            let hashes = response.data.hashes.slice()
            let responses: Array<API.MetadataResponse> = []

            //Sort hashes in order of first pages by order of page, then all the other files by order of import date
            const STEP = 100
            for (let i = 0; i < Math.min(i + STEP, hashes.length); i += STEP) {
                let metaDataResponse = await API.api_get_file_metadata({ hashes: hashes.slice(i, Math.min(i + STEP, hashes.length)), hide_service_names_tags: true,abortController:AbortControllerMetadata.current }).catch((reason) => {return})
                if (metaDataResponse) { responses.push(metaDataResponse.data.metadata) }
            }

            responses = responses.flat()
            let tempArray = []

            let allKnownTagsKey = sessionStorage.getItem('hydrus-all-known-tags');
            if (!allKnownTagsKey) { allKnownTagsKey = ''; console.error('Could not grab "all known tags" key from sessionStorage, this is bad.') }

            for (let entry of responses) {
                let serviceKeys = entry.service_keys_to_statuses_to_display_tags[allKnownTagsKey]
                let filter = TagTools.tagArrayToMap(serviceKeys[API.ServiceStatusNumber.Current] || [])
                //This gives all tags for grouping namespace, ideally only 1 result should exist
                let filterTags = TagTools.transformIntoTuple(filter).filter((element) => element["namespace"] === 'page')
                tempArray.push({ hash: entry.hash, page: filterTags, modifiedDate: entry.time_modified })

            }

            function sortResults(a: { hash: string, page: Array<TagTools.Tuple>, modifiedDate: number }, b: { hash: string, page: Array<TagTools.Tuple>, modifiedDate: number }): number {
                //If posssible to compare pages
                //TODO make it so having page makes you first
                if (a.page.length > 0 && b.page.length === 0) {
                    return -1
                }
                if (a.page.length === 0 && b.page.length > 0) {
                    return 1
                }
                if (a.page.length > 0 && b.page.length > 0) {
                    return parseInt(a.page[0].value) - parseInt(b.page[0].value)
                }
                else { //Compare by import date
                    return a.modifiedDate - b.modifiedDate
                }
            }

            tempArray.sort((a, b) => sortResults(a, b))
            let reverseHashes = tempArray.map((value, index) => { return value.hash })

            //For visual purpose reverse the order
            //let reverseHashes = response.data.hashes.slice().reverse()
            //Put hashes in session storage for other elements to use

            sessionStorage.setItem('group-hashes', JSON.stringify(reverseHashes))
            setCurrentTags(props.tags.slice())
            setRelatedHashes(reverseHashes)
        }
        //Only run search function when the tags are actually different that displayed
        if (JSON.stringify(currentTags) !== JSON.stringify(props.tags)) {
            Search()
        }

    }, [props.tags])

    useEffect(() => {
        function isCurrentImage(hash: string) {
            if (props.currentHash === hash) {
                return true
            }
            return false
        }

        let currentIndex = 0
        const windowSize = window.innerWidth
        // 27vw m
        // 7.5vw d
        let thumbHeight = 0
        if (isMobile()) {
            thumbHeight = Math.min(130, ((windowSize * (27 / 100)))) + 10
        }
        else {
            thumbHeight = windowSize * (7.5 / 100) + 10
        }
        //console.log(thumbHeight)

        const SIZEOFLABEL = 18

        //const OFFSET = 100


        if (relatedHashes.length > 1) {
            let temp = []
            for (let hash in relatedHashes) {
                let current = isCurrentImage(relatedHashes[hash])
                if (current === true) { currentIndex = parseInt(hash) }
                temp.push(
                    <ImageThumbnail
                        navigate={navigate.current}
                        currentImage={current}
                        replace={true}
                        type='image'
                        key={relatedHashes[hash]}
                        hash={relatedHashes[hash]}
                        loadMeta={false}
                        size={1}
                    />)
            }
            setThumbs(temp)
        }
        if (isMobile() && !isLandscapeMode()) {
            setScrollOffset((currentIndex * thumbHeight))
        }
        else {
            setScrollOffset((currentIndex * thumbHeight))
        }

    }, [relatedHashes, props.currentHash])

    useEffect(() => {
        if (expanded === false) { return }
        //This scrolls the div with every image change
        //const el = document.querySelector('.relatedStyleThumbsWrapper')
        const el = document.querySelector('#' + props.space)
        //Scroll vertically
        if (isMobile() && !isLandscapeMode()) {
            el?.scrollTo({ left: scrollOffset, top: 0, behavior: 'smooth' })
        }
        //Scroll horizontally
        else {
            el?.scrollTo({ left: 0, top: scrollOffset, behavior: 'smooth' })
        }


    }, [thumbs, scrollOffset])

    function getRelatedTextStyle(landscape: boolean): string {
        let style = 'relatedTextStyle'
        if (isMobile()) {
            style += ' mobile'
            if (landscape) {
                style += ' landscape'
            }
        }
        return style
    }

    useEffect(() => {
        return () => {
            AbortControllerMetadata.current?.abort()
            AbortControllerSearch.current?.abort()
        }
    },[])

    function getRelatedThumbsStyle(landscape: boolean): string {
        if (isMobile()) {
            if (landscape) { return "relatedThumbnails mobile landscape" }
            return "relatedThumbnails mobile"
        }
        return "relatedThumbnails"
    }

    function getRelatedThumbsWrapperStyle(landscape: boolean): string {
        let style = 'relatedStyleThumbsWrapper'
        if (isMobile()) {
            style += ' mobile'
            if (landscape) {
                style += ' landscape'
            }
        }
        if (expanded) {
            style += ' expanded'
        }
        return style
    }
    //<div className='relatedImages' ></div>
    return <>{
        (thumbs.length > 0) &&
        (<>
            <p onClick={() => { setExpanded(!expanded) }} className={getRelatedTextStyle(props.landscape)}>{props.tags}</p>
            <div id={props.space} className={getRelatedThumbsWrapperStyle(props.landscape)}>
                <div className={getRelatedThumbsStyle(props.landscape)}>{thumbs}</div>
            </div>
        </>)}
    </>
}