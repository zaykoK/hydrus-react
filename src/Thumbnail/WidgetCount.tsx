import { useEffect, useState } from 'react';
import './WidgetCount.css'
import * as API from '../hydrus-backend'

interface WidgetCountProps {
    count: number | undefined;
    tag?: string;
}

function WidgetCount(props: WidgetCountProps) {
    const [tagCount,setTagCount] = useState<number>(0)

    async function getFileCount(tag:string) {
        console.log(tag)
        let response = await API.api_get_files_search_files({tags:[[tag]],return_hashes:true})
        console.log(response.data.hashes.length)
        setTagCount(response.data.hashes.length)
    }

    useEffect(() => {
        if (props.tag !== undefined){
            getFileCount(props.tag)
        }
    })

    if (props.count === undefined || props.count === 1) { return <></> }
    let count;
    if (props.count !== undefined) { count = props.count }

    return <div className="widgetCount">{tagCount}</div>
}
export default WidgetCount