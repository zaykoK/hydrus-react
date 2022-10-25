import './WidgetCount.css';
import * as API from '../hydrus-backend';
import { useEffect, useState } from 'react';

interface WidgetCountProps {
    tag: string;
    style?: number; //1-"number",2-"pages"
}

function WidgetCount(props: WidgetCountProps) {
    const [tagCount, setTagCount] = useState<number>(0)

    async function getFileCount(tag: string) {
        if (tag === '' || tagCount !== 0) { return }
        let response = await API.api_get_files_search_files({ tags: [[tag]], return_hashes: true })
        setTagCount(response.data.hashes.length)
    }

    useEffect(() => {
        getFileCount(props.tag)
    }, [props.tag])
    if (props.style === 2) {
        return <div>{tagCount} pages</div>
    }
    else {
        return <>{(tagCount !== 0) && <div key={'widgetCount-' + tagCount} className="widgetCount">{tagCount}</div>}</>
    }
    

    
}
export default WidgetCount