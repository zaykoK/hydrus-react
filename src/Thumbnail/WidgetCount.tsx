import { useEffect, useState } from 'react';
import './WidgetCount.css'
import * as API from '../hydrus-backend'

interface WidgetCountProps {
    tag: string;
}

//TODO Merge this with WidgetCountTag, as those pretty much do the same

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

    return <>{(tagCount !== 0) && <div key={'widgetCount-' + tagCount} className="widgetCount">{tagCount}</div>}</>
}
export default WidgetCount