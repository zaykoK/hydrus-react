import './WidgetCount.css'
import * as API from '../hydrus-backend';
import { useEffect, useState } from 'react';

interface WidgetCountTagProps {
    tag: string;
}

export function WidgetCountTag(props:WidgetCountTagProps) {
    const [count,setCount] = useState<number>(0)
    async function getFileCount(tag:string) {
        console.log(tag)
        let response = await API.api_get_files_search_files({tags:[[tag]],return_hashes:true})
        console.log(response.data.hashes.length)
        setCount(response.data.hashes.length)
    }
    useEffect(() => {
        getFileCount(props.tag)
    })
    return <div>{count} pages</div>
}
export default WidgetCountTag