import colors from "./stylingVariables";
//lifted from https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


//Displays non-tag metadata about file
export function FileMetaData(props) {
    //console.log(props)
    const imageSize = [props.metadata.width, props.metadata.height]
    const urls = props.metadata.known_urls
    const mime = props.metadata.mime
    const inbox = props.metadata.is_inbox
    const size = props.metadata.size
    const hash = props.metadata.hash
    const date = props.metadata.time_modified

    //lifted from https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
    function timeConverter(UNIX_timestamp) {
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

    let links = []
    for (let el in urls) {
        let s = urls[el].split('/')
        let ss = s[2]
        links.push(<p key={hash + 'link' + urls[el]} style={{ margin: '1px' }} ><a style={{ color: 'lightBlue', textDecoration: 'none' }} href={urls[el]} >{ss}</a></p>)
    }

    const metadataStyle = {
        background: colors.COLOR2,
        color: 'white',
        margin: '5px',
        padding: '7px',
        borderRadius: '10px'
    }

    return <div style={metadataStyle}>
        <p key={hash + 'date'} style={{ margin: '1px' }}>Date: {timeConverter(date)}</p>
        <p key={hash + 'res'} style={{ margin: '1px' }}>Resolution: {imageSize[0]}x{imageSize[1]}</p>
        <p key={hash + 'size'} style={{ margin: '1px' }}>Size: {formatBytes(size)}</p>
        <p key={hash + 'contenttype'} style={{ margin: '1px' }}>Content-type : {mime}</p>
        <p key={hash + 'inbox'} style={{ margin: '1px' }}>{(inbox) ? ('Is not archived') : ('Is archived')}</p>
        {(links.length > 0) && <div key={hash + 'links'} style={{ margin: '1px' }}>Links:{links}</div>}
    </div>
}
