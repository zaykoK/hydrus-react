import * as API from '../hydrus-backend';
import { ImageThumbnail } from '../Thumbnail/ImageThumbnail';
import React, { useEffect, useState } from 'react';
import { tagArrayToNestedArray } from '../TagTools';

import "./RelatedFiles.css"

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

    async function Search() {
        if (props.tags === undefined) { return }
        let list = props.tags
        if (list.length === 0 || list === undefined) {
            setRelatedHashes(list)
            return
        }
        let response = await API.api_get_files_search_files({ tags: tagArrayToNestedArray(list), return_hashes: true, return_file_ids: false })
        sessionStorage.setItem('group-hashes', JSON.stringify(response.data.hashes.reverse()))
        setRelatedHashes(response.data.hashes)
    }

    useEffect(() => {
        Search()
    }, [])

    function returnCurrentImage(hash: string) {
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
                        currentImage={returnCurrentImage(relatedHashes[hash])}
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
    }, [relatedHashes, props])

    function returnStyle(mobile: boolean): string {
        if (!mobile) {
            return "relatedThumbnails mobile"
        }
        return "relatedThumbnails"
    }

    return <>{
        (thumbs.length != 0) &&
        (<>
            <p className="relatedTextStyle">Related Files for {props.space}</p>
            <div className={returnStyle(props.mobile)}>{thumbs}</div></>)}
        </>
}