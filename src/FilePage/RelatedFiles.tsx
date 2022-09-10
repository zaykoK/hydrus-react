import * as API from '../hydrus-backend';
import { ImageThumbnail } from '../Thumbnail/ImageThumbnail';
import { useEffect, useState } from 'react';
import { tagArrayToNestedArray } from '../TagTools';

import "./RelatedFiles.css"
import { isLandscapeMode, isMobile } from '../styleUtils';

interface RelatedFilesProps {
    tags: Array<string> | undefined; //Nested array only for searching
    currentHash: string | undefined;
    id: string;
    space: string;
    mobile: boolean;
}

export function RelatedFiles(props: RelatedFilesProps) {
    const [relatedHashes, setRelatedHashes] = useState<Array<string>>([])
    const [thumbs, setThumbs] = useState<Array<JSX.Element>>([])
    const [scrollOffset, setScrollOffset] = useState<number>(0);

    

    useEffect(() => {
        async function Search() {
            if (props.tags === undefined) { return }
            let list = props.tags
            if (list.length === 0 || list === undefined) {
                setRelatedHashes(list)
                return
            }
            //Get file hashes
            let response = await API.api_get_files_search_files({ tags: tagArrayToNestedArray(list), return_hashes: true, return_file_ids: false })
            //For visual purpose reverse the order
            let reverseHashes = response.data.hashes.slice().reverse()
            //Put hashes in session storage for other elements to use
            sessionStorage.setItem('group-hashes', JSON.stringify(reverseHashes))
            setRelatedHashes(reverseHashes)
        }

        Search()
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
                        currentImage={current}
                        replace={true}
                        type='image'
                        key={relatedHashes[hash]}
                        hash={relatedHashes[hash]}
                        loadMeta={false}
                        addTag={() => { return }}
                        size={1}
                    />)
            }
            setThumbs(temp)
        }
        if (isMobile() && !isLandscapeMode()) {
            setScrollOffset((currentIndex * thumbHeight))
        }
        else {
            setScrollOffset(SIZEOFLABEL + (currentIndex * thumbHeight))
        }

    }, [relatedHashes, props.currentHash])

    useEffect(() => {
        //This scrolls the div with every image change
        const el = document.querySelector('.relatedStyle')
        //Scroll vertically
        if (isMobile() && !isLandscapeMode()) {
            el?.scrollTo({ left: scrollOffset, top: 0, behavior: 'smooth' })
        }
        //Scroll horizontally
        else {
            el?.scrollTo({ left: 0, top: scrollOffset, behavior: 'smooth' })
        }


    }, [thumbs,scrollOffset])

    function getRelatedThumbsStyle(mobile: boolean): string {
        if (mobile) {
            if (isLandscapeMode()) { return "relatedThumbnails mobile landscape" }
            return "relatedThumbnails mobile"
        }
        return "relatedThumbnails"
    }

    return <>{
        (thumbs.length > 0) &&
        (<>
            <p className="relatedTextStyle">Related Files for {props.space}</p>
            <div className={getRelatedThumbsStyle(props.mobile)}>{thumbs}</div></>)}
    </>
}