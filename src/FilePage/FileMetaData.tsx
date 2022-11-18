import { useEffect, useState } from "react";
import { MetadataResponse } from "../hydrus-backend";
import { isLandscapeMode, isMobile } from "../styleUtils";
import './FileMetaData.css'
import * as API from '../hydrus-backend'

//lifted from https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
function formatBytes(bytes: number, decimals: number = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

//lifted from https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
function timeConverter(UNIX_timestamp: number): string {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
}

interface FileMetaDataProps {
    metadata: MetadataResponse;
    transcode: string | undefined;
}

function getMetadataCardStyle(): string {
    let style = 'metadataCard'
    if (isMobile()) {
        style += ' mobile'
        if (isLandscapeMode()) {
            style += ' landscape'
        }
    }
    return style
}

//Displays non-tag metadata about file
export function FileMetaData(props: FileMetaDataProps) {
    const [imageSize, setImageSize] = useState<Array<number>>([props.metadata.width, props.metadata.height])
    const [mime, setMime] = useState<string>(props.metadata.mime)
    const [urls, setURLs] = useState(props.metadata.known_urls)
    //console.log(props)
    const [inbox, setInbox] = useState(props.metadata.is_inbox)
    const [size, setSize] = useState(props.metadata.size)
    const [hash, setHash] = useState(props.metadata.hash)
    const [date, setDate] = useState(props.metadata.time_modified)


    useEffect(() => {
        async function loadTranscodedInfo() {
            if (props.transcode) {
                let response = await API.api_get_file_metadata({ hash: props.transcode, only_return_basic_information: true })
                setImageSize([response?.data.metadata[0].width, response?.data.metadata[0].height])
                setMime(response?.data.metadata[0].mime)
                setSize(response?.data.metadata[0].size)
                setURLs(props.metadata.known_urls)
                setInbox(props.metadata.is_inbox)
                setDate(props.metadata.time_modified)
                setHash(props.metadata.hash)
            }
            else {
                setImageSize([props.metadata.width, props.metadata.height])
                setMime(props.metadata.mime)
                setSize(props.metadata.size)
                setURLs(props.metadata.known_urls)
                setInbox(props.metadata.is_inbox)
                setDate(props.metadata.time_modified)
                setHash(props.metadata.hash)
            }
        }
        loadTranscodedInfo()
        ///THIS NEEDS BETTER WAY OF DETERMINING WHEN AS IT IS DOING THIS FUNCTION TWICE
        ///when metadata changes and then when transcode changes
    }, [props])

    let links = []
    for (let el in urls) {
        let s = urls[el].split('/')
        let ss = s[2]
        links.push(<p key={hash + 'link' + urls[el]} ><a className="metadataLink" href={urls[el]} >{ss}</a></p>)
    }

    return <div className={getMetadataCardStyle()}>
        {(props.transcode !== undefined) ? <p key={hash + props.transcode}>Transcoded</p> : <p key={hash + props.transcode}>Original</p>}
        <p key={hash + 'date'}  >Date: {timeConverter(date)}</p>
        <p key={hash + 'res'}  >Resolution: {imageSize[0]}x{imageSize[1]}</p>
        <p key={hash + 'size'}  >Size: {formatBytes(size)}</p>
        <p key={hash + 'contenttype'}  >Content-type : {mime}</p>
        <p key={hash + 'inbox'}  >{(inbox) ? ('Is not archived') : ('Is archived')}</p>
        {(links.length > 0) && <><p key="metadataLinks">Links:</p>{links}</>}
    </div>
}
