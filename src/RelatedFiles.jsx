import * as API from './hydrus-backend';
import { ImageThumbnail } from './ImageThumbnail';
import React, { useEffect, useState,useRef } from 'react';

export function RelatedFiles(props) {
    let imageGroupSpaces = ['group-title', 'pixiv-title', 'doujin-title']
    const [relatedHashes, setRelatedHashes] = useState([])
    const [thumbs, setThumbs] = useState()
    const [currentThumb, setCurrentThumb] = useState()

    async function Search() {
        let list = props.tags
        let final = list
        if (list.length === 0 || list === undefined) {
            setRelatedHashes(list)
            return
        }
        if (list.length > 1) {
            final = [list]
        }
        let response = await API.api_get_files_search_files({ tags: final, return_hashes: true, return_file_ids: false })
        setRelatedHashes(response.data.hashes)
    }

    useEffect(() => {
        Search()
    }, [])

    useEffect(() => {
        if (relatedHashes.length > 1) {
            let temp = []
            for (let hash in relatedHashes) {
                if (props.currentHash === relatedHashes[hash]) {
                    temp.push(
                        <ImageThumbnail
                            loading='lazy'
                            currentImage={true}
                            elementId={relatedHashes[hash]}
                            replace={true}
                            type='image'
                            key={relatedHashes[hash]}
                            hash={relatedHashes[hash]}
                            loadMeta={false}
                        />)
                }
                else {
                    temp.push(
                        <ImageThumbnail
                            loading='lazy'
                            elementId={relatedHashes[hash]}
                            replace={true}
                            type='image'
                            key={relatedHashes[hash]}
                            hash={relatedHashes[hash]}
                            loadMeta={false}
                        />)
                }
            }
            setThumbs(temp)
        }
    }, [relatedHashes,props])

    const relatedThumbsStyle = {
        display: 'flex',
        gap: '5px',
        flexDirection: 'column-reverse'
    }

    return <>{
        (thumbs != undefined) &&
        (<><p>Related Files for {props.space}</p> <div style={relatedThumbsStyle}>{thumbs}</div></>)}</>
}