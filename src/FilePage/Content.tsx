import * as API from '../hydrus-backend';
import * as React from 'react';

import { useSwipeable } from 'react-swipeable';
import { isLandscapeMode, isMobile } from '../styleUtils';
import { TransformComponent, TransformWrapper } from "@pronestor/react-zoom-pan-pinch"
import { useNavigate, useParams } from "react-router-dom"

import { NextImage, NextSearchImage, PreviousImage, PreviousSearchImage, GoToFirstImage, GoToLastImage } from './ImageControls';
import { getTranscodeEnabled } from '../StorageUtils';

interface ContentProps {
    type: string;
    hash: string | undefined;
    landscape: boolean;
    setTranscodedHash: Function;
    setTopBarVisible: Function;
}

function Content(props: ContentProps) {
    const navigate = useNavigate()
    const { parm } = useParams()

    const swipeHandlers = useSwipeable({
        onSwipedLeft: (eventData) => {
            NextImage(props.hash, navigate, parm)
        },
        onSwipedRight: (eventData) => {
            PreviousImage(props.hash, navigate, parm)
        },
        onTap: (eventData) => {
            changeZoom()
        },
        delta: 150
    })

    const [style, changeStyle] = React.useState(getStartingStyle())
    const [src, setSrc] = React.useState(API.api_get_file_thumbnail_address(props.hash))
    //const [loaded, setLoaded] = React.useState<boolean>(false)

    function getStartingStyle() {
        if (isMobile()) {
            if (isLandscapeMode()) { return 'styleFitHeight mobile landscape' }
            return 'styleFitHeight mobile'
        }
        if (sessionStorage.getItem('fullscreen-view') === 'true') { return 'styleFitWidth' }
        return 'styleFitHeight'
    }

    function changeZoom() {
        if (isMobile()) {
            return
        }
        switch (style) {
            case 'styleFitHeight':
                changeStyle('styleFitWidth');
                sessionStorage.setItem('fullscreen-view', 'true')
                break;
            case 'styleFitWidth':
                changeStyle('styleFitHeight');
                sessionStorage.setItem('fullscreen-view', 'false')
                break;
        }
    }
    //TODO expose all key binds to options
    const handleKeyPress = (e: KeyboardEvent) => {
        if ((e.ctrlKey && e.key === "ArrowLeft") || e.key === 'A') { e.preventDefault(); GoToFirstImage(navigate, parm); return }
        if ((e.ctrlKey && e.key === "ArrowRight") || e.key === 'D') { e.preventDefault(); GoToLastImage(navigate, parm); return }
        if (e.key === "d" || e.key === "ArrowRight") { NextImage(props.hash, navigate, parm) }
        if (e.key === "a" || e.key === "ArrowLeft") { PreviousImage(props.hash, navigate, parm) }
        if (e.key === "s" || e.key === "ArrowDown") { NextSearchImage(props.hash, navigate, parm) }
        if (e.key === "w" || e.key === "ArrowUp") { PreviousSearchImage(props.hash, navigate, false, parm) }
        if (e.key === "Home") { GoToFirstImage(navigate, parm) }
        if (e.key === "End") { GoToLastImage(navigate, parm) }
    }

    // const handleMouseScroll = (e: WheelEvent) => {
    //     //console.log(e.deltaY)
    //     if (sessionStorage.getItem('fullscreen-view') === 'true') {
    //         const el = document.querySelector('.styleFitWidth')
    //         //console.log(el)

    //         //What I want to get here is ability to zoom in/out with mouse scroll and pan with drag

    //         if (e.deltaY > 0) { console.log('scrolling down') }
    //         if (e.deltaY < 0) { console.log('scrolling up') }
    //     }
    // }

    type transcodedFileServiceOptions = {
        fileServiceName?: string;
        fileServiceKey?: string;
        namespace: string;

    }

    React.useEffect(() => {
        const img = new Image()
        async function loadFullSizeImage() {
            //console.time(props.hash + ' loading time')

            //EXPERIMENTAL
            //try to load smaller transcoded version of the file if available
            let enabled = getTranscodeEnabled()
            if (enabled) {
                //1. Get transcoded file service name
                let localStorageRead = localStorage.getItem('transcoded-file-options')
                let transcodedFileServiceOptions: transcodedFileServiceOptions
                //If options defined parse them
                if (localStorageRead) {
                    transcodedFileServiceOptions = JSON.parse(localStorageRead)
                }
                //Default case
                else {
                    transcodedFileServiceOptions = { fileServiceName: 'web-transcodes', namespace: 'original' }
                }
                //Create a search query
                let searchTag = [[transcodedFileServiceOptions.namespace + ':' + props.hash]]
                //Search given file service for the query
                let response = await API.api_get_files_search_files({ tags: searchTag, file_service_name: transcodedFileServiceOptions.fileServiceName, file_service_key: transcodedFileServiceOptions.fileServiceKey, return_hashes: true })
                //Extract hash
                let transcodeHash = response.data.hashes[0]
                //If more than 1 result found throw an error, it's not critical but it suggest that the setup might be compromised
                if (response.data.hashes.length > 1) { console.warn('There is more than one file trascode assigned to hash, this is wrong and might create problems.') }
                //If transcode exists for the file use it
                if (transcodeHash) { img.src = API.api_get_file_address(transcodeHash) || ''; props.setTranscodedHash(transcodeHash) }
                else { //Just load the file normally
                    img.src = API.api_get_file_address(props.hash) || ''
                    props.setTranscodedHash()
                }
            }
            else { //Just load the file normally
                img.src = API.api_get_file_address(props.hash) || ''
                props.setTranscodedHash()
            }
            img.onload = () => { setSrc(img.src); }//console.timeEnd(props.hash + ' loading time'); }

        }
        //Immediately start loading full size image, and when ready change to it

        loadFullSizeImage()

        document.addEventListener('keydown', handleKeyPress)
        //document.addEventListener('wheel', handleMouseScroll)

        return () => {
            //console.timeEnd(props.hash + ' loading time');
            //Apparantely sending empty string will hammer website hosting, but also I read that since firefox 3.5 it's fixed
            img.src = ''
            img.onload = null
            document.removeEventListener('keydown', handleKeyPress)
            //document.removeEventListener('wheel', handleMouseScroll)
        }
    }, [])
    //Basically in case of images
    //When in portait mode
    let content: JSX.Element = <img
        key={'imgComponent' + props.hash}
        onClick={() => changeZoom()}
        onContextMenu={(e) => { e.preventDefault(); props.setTopBarVisible(false) }}
        src={src}
        className={style}
        alt={props.hash} />
    let doubleClick = {}
    if (props.type.includes("video")) {
        content = <video
            key={'imgComponent' + props.hash}
            onContextMenu={(e) => { e.preventDefault(); props.setTopBarVisible(false) }}
            className={style}
            autoPlay loop controls
            src={API.api_get_file_address(props.hash)} />
        doubleClick = {...doubleClick, disabled:true}
    }
    //Default case - just use a thumbnail
    return <TransformWrapper
        centerZoomedOut={true}
        centerOnInit={true}
        limitToBounds={true}
        doubleClick={doubleClick}
        wheel={{ step: 0.5 }}
        minScale={1}
        initialScale={1}
        panning={{ velocityDisabled: true }}
        onPanning={(e) => {
            if (e.state.scale === 1) {
                if (e.state.positionX === 100) { PreviousImage(props.hash, navigate, parm) }
                if (e.state.positionX === -100) { NextImage(props.hash, navigate, parm) }
            }
        }} >
        <TransformComponent
            wrapperStyle={{ width: "inherit", height: "inherit" }}
            contentStyle={{ width: "inherit", height: "inherit", justifyContent: "center" }} >
            {content}
        </TransformComponent>
    </TransformWrapper>
}

export default Content