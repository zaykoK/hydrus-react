import * as API from '../hydrus-backend';
import * as React from 'react';

import { isLandscapeMode, isMobile } from '../styleUtils';
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch"
import { useNavigate, useParams } from "react-router-dom"

import { NextImage, NextSearchImage, PreviousImage, PreviousSearchImage, GoToFirstImage, GoToLastImage } from './ImageControls';
import { getTranscodeEnabled } from '../StorageUtils';

interface ContentProps {
    type: string;
    hash: string | undefined;
    setTranscodedHash: Function;
    setTopBarVisible: Function;
}

type doubleClick = {
    disabled?: boolean;
    step?: number;
    mode?: "reset" | "zoomIn" | "zoomOut";
    animationTime?: number;
    animationType?: "easeOut" | "linear" | "easeInQuad" | "easeOutQuad" | "easeInOutQuad" | "easeInCubic" | "easeOutCubic" | "easeInOutCubic" | "easeInQuart" | "easeOutQuart" | "easeInOutQuart" | "easeInQuint" | "easeOutQuint" | "easeInOutQuint";
    excluded?: Array<string>;
}

type transcodedFileServiceOptions = {
    fileServiceName?: string;
    fileServiceKey?: string;
    namespace: string;
}

function Content(props: ContentProps) {
    const navigate = useNavigate()
    const { currentURLParameters } = useParams()
    const [doubleClick, setDoubleClick] = React.useState<doubleClick>({ step: 0.5 })

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

    //TODO expose all key binds to options
    const handleKeyPress = (e: KeyboardEvent) => {
        if ((e.ctrlKey && e.key === "ArrowLeft") || e.key === 'A') { e.preventDefault(); GoToFirstImage(navigate, currentURLParameters); return }
        if ((e.ctrlKey && e.key === "ArrowRight") || e.key === 'D') { e.preventDefault(); GoToLastImage(navigate, currentURLParameters); return }
        if (e.key === "d" || e.key === "ArrowRight") { NextImage(props.hash, navigate, currentURLParameters) }
        if (e.key === "a" || e.key === "ArrowLeft") { PreviousImage(props.hash, navigate, currentURLParameters) }
        if (e.key === "s" || e.key === "ArrowDown") { NextSearchImage(props.hash, navigate, currentURLParameters) }
        if (e.key === "w" || e.key === "ArrowUp") { PreviousSearchImage(props.hash, navigate, false, currentURLParameters) }
        if (e.key === "Home") { GoToFirstImage(navigate, currentURLParameters) }
        if (e.key === "End") { GoToLastImage(navigate, currentURLParameters) }
    }

    async function loadFullSizeOriginal() {
        const img = new Image()
        img.src = API.api_get_file_address(props.hash) || ''
        img.onload = () => { setSrc(img.src); props.setTranscodedHash(); }
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
                if (response && response.data.hashes) {
                    let transcodeHash: string = response?.data.hashes[0]
                    //If more than 1 result found throw an error, it's not critical but it suggest that the setup might be compromised
                    if (response.data.hashes.length > 1) { console.warn('There is more than one file trascode assigned to hash, this is wrong and might create problems.') }
                    //If transcode exists for the file use it
                    if (transcodeHash) { img.src = API.api_get_file_address(transcodeHash) || ''; props.setTranscodedHash(transcodeHash) }
                    else { //Just load the file normally
                        img.src = API.api_get_file_address(props.hash) || ''
                        props.setTranscodedHash()
                    }
                }
            }
            else { //Just load the file normally
                img.src = API.api_get_file_address(props.hash) || ''
                props.setTranscodedHash()
            }
            img.onload = () => { setSrc(img.src); }

        }
        //Immediately start loading full size image, and when ready change to it

        loadFullSizeImage()

        document.addEventListener('keydown', handleKeyPress)

        return () => {
            //console.timeEnd(props.hash + ' loading time');
            //Apparantely sending empty string will hammer website hosting, but also I read that since firefox 3.5 it's fixed
            img.src = ''
            img.onload = null
            document.removeEventListener('keydown', handleKeyPress)
        }
    }, [])

    // This controls when loading of new image should kick in
    const ZOOM_THRESHOLD = 3

    //Basically in case of images
    //When in portait mode
    let content: JSX.Element = <img
        key={'imgComponent' + props.hash}
        onClick={() => props.setTopBarVisible(false)}
        onContextMenu={(e) => { e.preventDefault() }}
        src={src}
        className={style}
        alt={props.hash} />
    if (props.type.includes("video")) {
        content = <video
            controlsList='nodownload noplaybackrate nofullscreen noremoteplayback'
            disablePictureInPicture
            disableRemotePlayback
            key={'imgComponent' + props.hash}
            onContextMenu={(e) => { e.preventDefault(); props.setTopBarVisible(false) }}
            className={style}
            autoPlay loop controls
            src={API.api_get_file_address(props.hash)} />
        if (doubleClick.disabled !== true)
            setDoubleClick({ ...doubleClick, disabled: true })
    }
    return <TransformWrapper
        centerZoomedOut={true}
        centerOnInit={true}
        limitToBounds={true}
        doubleClick={doubleClick}
        wheel={{ step: 0.5 }}
        minScale={1}
        initialScale={1}
        panning={{ velocityDisabled: true }}
        onZoomStop={(e) => {
            if (e.state.scale > ZOOM_THRESHOLD && src !== API.api_get_file_address(props.hash)) {
                loadFullSizeOriginal()
            }
        }}
        onPanning={(e) => {
            if (e.state.scale === 1) {
                //This line locks vertical movement of image when scale == 1
                e.setTransform(e.state.positionX, 0, e.state.scale, 0, 'linear')
                if (e.state.positionX === 100) {
                    PreviousImage(props.hash, navigate, currentURLParameters)
                }
                if (e.state.positionX === -100) {
                    NextImage(props.hash, navigate, currentURLParameters)
                }
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