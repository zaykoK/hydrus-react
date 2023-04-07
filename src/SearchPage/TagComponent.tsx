import { useEffect, useRef, useState } from "react";
import { NavigateFunction } from "react-router-dom";
import { isMobile } from "../styleUtils";
import { MemoThumbnail as ImageThumbnail } from '../Thumbnail/ImageThumbnail';
import * as API from '../hydrus-backend'

import './TagComponent.css'
import { generateSearchURL, navigateTo } from "./SearchPageHelpers";
import { getComicNamespace } from "../StorageUtils";

interface TagComponentProps {
    tag: API.APITagResponse;
    allowed: boolean;
    navigate: NavigateFunction;
    size?: number;
}

function TagComponent(props: TagComponentProps) {
    const [thumbnail, setThumbnail] = useState<JSX.Element>();
    const [title, setTitle] = useState<string>();
    const [color, setColor] = useState<string>();

    const abortController = useRef(new AbortController())

    async function loadImage() {
        // Split tag into [namespace,rest]
        // TODO move this to its own function, or find one I made it

        let [first, ...rest] = props.tag.value.split(':')
        // set Color and Title of card
        // Could be done without state
        setColor(first)
        setTitle(rest.join(':'))

        // Set search criteria
        // We're looking for a single image of given tag value
        const search: Array<Array<string> | string> = ['system:limit=1', props.tag.value, ['system:filetype is image', 'system:filetype is video', 'system:filetype is gif']]
        let finalSearch = [...search]

        // For comics we're ideally looking for cover
        const comicFirstPage = ['page:0', 'page:1']
        // If possible find a preferred image for cover
        // Idea is you can tag image with cover:<namespace>, or something else when I'll add that as a setting
        // Then that tag in combination with actual searched tag will give you your favourite thumbnail
        const favourite = [`cover:${first}`]
        
        let sortType = API.FileSortType.Random
        // Special settings for comics -> sort by import date and look for page:0 or page:1
        if (props.tag.value.includes(getComicNamespace())) {
            sortType = API.FileSortType.ImportTime
            finalSearch.push([...comicFirstPage])
        }
        else {
            finalSearch.push(favourite)
        }
        // Do more specific search first
        let result = await API.api_get_files_search_files({
            tags: finalSearch,
            return_hashes: true,
            file_sort_type: sortType,
            abortController: abortController.current
        })
        console.log(result?.status)
        // By default just keep empty hash
        let hash: string = ""
        // If search has no results (no page for comics, no favourite image), just look for any image having given tag
        if (result?.data.hashes) {
            if (result.data.hashes.length === 0) {
                finalSearch = search
                result = await API.api_get_files_search_files({
                    tags: finalSearch,
                    return_hashes: true,
                    file_sort_type: sortType,
                    abortController: abortController.current
                })
            }
            if (result?.data.hashes) {
                hash = result.data.hashes[0]
            }
        }
        const thumb = <ImageThumbnail size={4} hash={hash} loadMeta={false} replace={false} type={""} navigate={props.navigate} />
        setThumbnail(thumb)
    }

    function handleClick() {
        let params = generateSearchURL([[props.tag.value]], 0, '', "image")
        navigateTo(params, props.navigate, 'image')
    }


    useEffect(() => {
        const condition = props.allowed && thumbnail !== null
        if (condition) {
            if (abortController.current) {
                abortController.current.abort()
            }
            abortController.current = new AbortController()
            loadImage()
        }
        return () => {
            abortController.current.abort()
        }
    }, [props.allowed])

    function getTagComponentStyle() {
        let style = 'TagComponent'
        if (props.size == 0) {
            style += ' square'
        }
        if (props.size == 1) {
            style += ' page'
        }
        if (isMobile()) { style += ' mobile' }
        return style
    }



    return <div className={getTagComponentStyle()} onClick={handleClick}>
        <p className='TagComponentTitle' style={{ filter: `drop-shadow(0px 0px 6px var(--color-${color})) drop-shadow(0px 0px 5px black)` }}>{title}</p>
        {thumbnail}
        <p className='TagComponentCount'>
            {props.tag.count}
        </p>
    </div>
}

export default TagComponent;