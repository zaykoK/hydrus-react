import * as API from './hydrus-backend';
import { ImageThumbnail } from './ImageThumbnail';
import React, { useEffect, useState } from 'react';

export function RelatedFiles(props) {
    const [relatedHashes, setRelatedHashes] = useState([])
    const [thumbs, setThumbs] = useState()

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

    function returnCurrentImage(hash) {
        if (props.currentHash === hash) {
            return true
        } else {
            return false
        }
    }


    useEffect(() => {
        if (relatedHashes.length > 1) {
            let temp = []
            for (let hash in relatedHashes) {
                temp.push(
                    <ImageThumbnail
                        loading='lazy'
                        currentImage={returnCurrentImage(relatedHashes[hash])}
                        elementId={relatedHashes[hash]}
                        replace={true}
                        type='image'
                        key={relatedHashes[hash]}
                        hash={relatedHashes[hash]}
                        loadMeta={false}
                    />)
            }
            setThumbs(temp)
        }
    }, [relatedHashes, props])

    function returnStyle(mobile) {
        //console.log(mobile)
        if (!mobile) {
            return {
                display: 'flex',
                gap: '5px',
                flexDirection: 'column-reverse',
            }
        }
        return {
            display: 'flex',
            flexWrap:'nowrap',
            whiteSpace:'nowrap',
            gap: '5px',
            flexDirection: 'row',
            overflowX: 'auto',
            width: 'max-content'
        }
    }

    const relatedTextStyle = {
        position: 'relative',
        fontSize: '1em',
        margin: '1px'
    }

    return <>{
        (thumbs != undefined) &&
        (<>
            <p style={relatedTextStyle}>Related Files for {props.space}</p>
            <div style={returnStyle(props.mobile)}>{thumbs}</div></>)}</>
}