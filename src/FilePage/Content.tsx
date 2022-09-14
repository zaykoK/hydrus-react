import * as API from '../hydrus-backend';
import * as React from 'react';

import { useSwipeable } from 'react-swipeable';
import { isLandscapeMode, isMobile } from '../styleUtils';
import { TransformComponent, TransformWrapper } from "@pronestor/react-zoom-pan-pinch"
import { useNavigate } from "react-router-dom"

import { NextImage, NextSearchImage, PreviousImage, PreviousSearchImage, GoToFirstImage, GoToLastImage } from './ImageControls';

interface ContentProps {
    type: string;
    hash: string | undefined;
}

function Content(props: ContentProps) {
    const navigate = useNavigate()

    const swipeHandlers = useSwipeable({
        onSwipedLeft: (eventData) => {
            NextImage(props.hash, navigate)
        },
        onSwipedRight: (eventData) => {
            PreviousImage(props.hash, navigate)
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

    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === 'ArrowLeft') { GoToFirstImage(navigate); return }
        if (e.ctrlKey && e.key === 'ArrowRight') { GoToLastImage(navigate); return }
        if (e.key === "ArrowRight") { NextImage(props.hash, navigate) }
        if (e.key === "ArrowLeft") { PreviousImage(props.hash, navigate) }
        if (e.key === "ArrowDown") { NextSearchImage(props.hash, navigate) }
        if (e.key === "ArrowUp") { PreviousSearchImage(props.hash, navigate) }
        if (e.key === "Home") { GoToFirstImage(navigate) }
        if (e.key === "End") { GoToLastImage(navigate) }
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

    React.useEffect(() => {
        const img = new Image()
        function loadFullSizeImage(): void {
            //console.time(props.hash + ' loading time')
            
            img.src = API.api_get_file_address(props.hash) || ''
            img.onload = () => { setSrc(img.src);}
        }
        //Immediately start loading full size image, and when ready change to it
        
        loadFullSizeImage()
        
        document.addEventListener('keydown', handleKeyPress)
        //document.addEventListener('wheel', handleMouseScroll)

        return () => {
            //console.timeEnd(props.hash + ' loading time');
            img.src = ''
            img.onload = () => {}
            document.removeEventListener('keydown', handleKeyPress)
            //document.removeEventListener('wheel', handleMouseScroll)
        }
    }, [])

    //Basically in case of images
    //When in portait mode
    if (props.type.includes("image")) {
        let image = <img
            {...swipeHandlers}
            key={'imgComponent' + props.hash}
            onClick={() => changeZoom()}
            onContextMenu={(e) => e.preventDefault()}
            src={src}
            className={style}
            alt={props.hash} />
        if (isMobile()) {
            if (isLandscapeMode()) {
                return <TransformWrapper
                    centerZoomedOut={true}
                    minScale={1}
                    initialScale={1}>
                    <TransformComponent>
                        {image}
                    </TransformComponent>
                </TransformWrapper>
            }
            return image
        }
        return image
    }
    if (props.type.includes("video")) {
        return <video
            {...swipeHandlers}
            key={'imgComponent' + props.hash}
            onContextMenu={(e) => e.preventDefault()}
            className={style}
            autoPlay loop controls
            src={API.api_get_file_address(props.hash)} />
    }
    //Default case - just use a thumbnail
    return <img
        {...swipeHandlers}
        key={'imgComponent' + props.hash}
        onContextMenu={(e) => e.preventDefault()}
        src={API.api_get_file_thumbnail_address(props.hash)}
        className={style}
        alt={props.hash} />
}

export default Content