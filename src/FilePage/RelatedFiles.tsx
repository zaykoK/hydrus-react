import * as API from '../hydrus-backend';
import { ImageThumbnail } from '../Thumbnail/ImageThumbnail';
import { useEffect, useState } from 'react';
import { tagArrayToNestedArray } from '../TagTools';

import "./RelatedFiles.css"
import { isLandscapeMode } from '../styleUtils';

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

    async function Search() {
        if (props.tags === undefined) { return }
        let list = props.tags
        if (list.length === 0 || list === undefined) {
            setRelatedHashes(list)
            return
        }
        let response = await API.api_get_files_search_files({ tags: tagArrayToNestedArray(list), return_hashes: true, return_file_ids: false })
        let reverseHashes = response.data.hashes.slice()
        sessionStorage.setItem('group-hashes', JSON.stringify(reverseHashes))
        setRelatedHashes(response.data.hashes)
    }

    useEffect(() => {
        Search()
    }, [])

    function returnCurrentImage(hash: string) {
        if (props.currentHash === hash) {
            return false
        } else {
            return true
        }
    }

    useEffect(() => {
        let currentIndex = 0
        const thumbHeight = 185


        if (relatedHashes.length > 1) {
            let temp = []
            for (let hash in relatedHashes) {
                let current = returnCurrentImage(relatedHashes[hash])
                if (current === false) { currentIndex = parseInt(hash) }
                temp.push(
                    <ImageThumbnail
                        currentImage={current}
                        replace={true}
                        type='image'
                        key={relatedHashes[hash]}
                        hash={relatedHashes[hash]}
                        loadMeta={false}
                        addTag={() => { return }}
                    />)
            }
            setThumbs(temp)
        }
        setScrollOffset(currentIndex * thumbHeight)
    }, [relatedHashes, props.currentHash])

    useEffect(() => {
        //This scrolls the div with every image change
        const el = document.querySelector('.relatedStyle')
        el?.scrollTo({ left: 0, top: scrollOffset - 290, behavior: 'smooth' })
    }, [thumbs])

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