import React, { Fragment, useEffect, useState } from "react";
import { NavigateFunction } from "react-router-dom";
import { isMobile } from "../styleUtils";
import { ResultGroup } from "./SearchPage";
import { MemoThumbnail as ImageThumbnail } from '../Thumbnail/ImageThumbnail';

import './ResultComponent.css'

interface ResultComponentProps {
    navigate: NavigateFunction;
    result: ResultGroup;
    type: string;
    grouping: boolean;
}

function ResultComponent(props: ResultComponentProps) {
    const [thumblist, setThumblist] = useState<Array<JSX.Element>>([])
    const [scrollable, setScrollable] = useState<boolean>(false)
    const [cover, setCover] = useState<JSX.Element | null>(null)
    const [isShowingDetails, setIsShowingDetails] = useState<boolean>(false)

    useEffect(() => {
        let tempThumbs: Array<JSX.Element> = []
        // If subgroups exist display subgroups
        let tLength = props.result.subgroups.size
        if (tLength > 0) {
            let sortedList = [...props.result.subgroups.values()].sort((a, b) => a.title.localeCompare(b.title))
            props.result.cover = sortedList[0].cover
            for (let subgroup of sortedList) {
                let thumb = <ImageThumbnail
                    navigate={props.navigate}
                    loadMeta={true}
                    type={props.type}
                    key={subgroup.cover}
                    hash={subgroup.cover}
                    replace={false}
                    metadata={subgroup.entries}
                    size={1}
                    hideWidgetCount={true}
                />
                tempThumbs.push(thumb)
            }
            setCover(<ImageThumbnail
                navigate={props.navigate}
                loadMeta={true}
                type={props.type}
                key={props.result.cover}
                hash={props.result.cover}
                replace={false}
                metadata={props.result.entries}
                size={4}
                hideWidgetCount={false}
            />)
        }
        else {
            let entries = props.result.entries
            let sortedEntries = entries.sort((a, b) => a.time_modified - b.time_modified)
            props.result.cover = sortedEntries[0].hash
            for (let entry of sortedEntries) {
                let thumb = <ImageThumbnail
                    navigate={props.navigate}
                    loadMeta={true}
                    type={props.type}
                    key={entry.hash + props.result.title}
                    hash={entry.hash}
                    replace={false}
                    metadata={[entry]}
                    size={1}
                    hideWidgetCount={false}
                />
                tempThumbs.push(thumb)
                setCover(<ImageThumbnail
                    navigate={props.navigate}
                    loadMeta={true}
                    type={props.type}
                    key={props.result.cover + props.result.title}
                    hash={props.result.cover}
                    replace={false}
                    metadata={props.result.entries}
                    size={4}
                    hideWidgetCount={false}
                />)
                // Change to random cover picture, WIP
                //setInterval(() => {setCover(tempThumbs[Math.floor(Math.random() * tempThumbs.length)])},3500)
            }
        }
        setThumblist(tempThumbs)

    }, [])


    function getComponentStyle(size: number): string {
        let style = 'ResultComponent'
        if (isMobile()) {
            style += ' mobile'
        }
        if (size > 1) {
            style += ' bigger'
        }
        if (props.result.type === 'comic') {
            style += ' comic'
        }
        if (isShowingDetails) style += ' active'
        return style
    }
    function getWrapperComponentStyle(size: number, scrollable: boolean) {
        let style = "ResultComponentWrapper"
        if (isMobile()) {
            style += ' mobile'
        }
        if (scrollable) {
            style += ' scrollable'
        }
        if (size > 1) {
            style += ' bigger'
        }
        if (props.result.type === 'comic') {
            style += ' comic'
        }
        return style
    }

    function getTopText(): string {
        if (props.result.title !== props.result.cover) {
            return props.result.title
        }
        return ''
    }
    function getResultCount(): string {
        if (thumblist.length > 1) {
            return thumblist.length.toString()
        }
        return ''

    }

    function getCoverStyle(): string {
        let style = 'ResultComponentCover'
        if (scrollable) {
            style += ' hidden'
        }
        if (isMobile()) {
            style += ' mobile'
        }
        return style
    }
    function getCoverTopbarStyle(): string {
        let style = 'ResultComponentTopBar'
        if (isMobile()) {
            style += ' mobile'
        }
        return style
    }
    function getResultCountStyle(): string {
        let style = 'ResultComponentCountWidget'
        if (isMobile()) {
            style += ' mobile'
        }
        return style
    }

    function showExpandButtonText(details: boolean): string {
        if (details) return '-'
        else return '+'
    }

    function getExpandButtonStyle(details:boolean):string {
        let style = 'ResultComponentExpandButton'
        if (details) style += ' active'
        return style
    }

    function toggleDetails() {
        if (isShowingDetails) setIsShowingDetails(false)
        else setIsShowingDetails(true)
    }

    return <Fragment><div
        className={getComponentStyle(thumblist.length)}
        /*         onMouseLeave={(e) => { setIsShowingDetails(false) }}
                onMouseEnter={(e) => { setIsShowingDetails(true) }} */
/*         onClick={(e) => {
            if (isMobile()) {
            }
            else {
                e.stopPropagation();
                // console.log('marking ' + props.result.cover)
            }
        }}  */
        onContextMenu={(e) => {
            if (isMobile()) {
                e.preventDefault()
                toggleDetails()
            }
        }}>
        {/* {(!isMobile()) ? <div className={getWrapperComponentStyle(thumblist.length, scrollable)}>{thumblist}</div> : null} */}
        {<div className={getCoverStyle()}>
            <div className={getCoverTopbarStyle()}>{getTopText()}</div>
            {cover}
            <div className={getResultCountStyle()}>{getResultCount()}</div>
        </div>}
        {(!isMobile()) ?<div className={getExpandButtonStyle(isShowingDetails)}
            onClick={(e) => {
                e.stopPropagation()
                toggleDetails()
            }} >
            {(showExpandButtonText(isShowingDetails))}
        </div>:null}
    </div>
        {(isShowingDetails) ? <ResultDetails result={props.result} navigate={props.navigate} cover={cover} thumblist={thumblist} /> : null}
    </Fragment>
}
interface ResultDetailsProps {
    result: ResultGroup;
    navigate: NavigateFunction;
    cover: JSX.Element | null;
    thumblist: Array<JSX.Element>;
}

function ResultDetails(props: ResultDetailsProps) {
    function getResultDetailsStyle():string {
        let style = 'ResultDetails'
        if (isMobile()) style += ' mobile'
        return style
    }
    function getResultDetailsThumbnailsStyle(count:number):string {
        let style = 'ResultDetailsThumbnails'
        if (isMobile()) style += ' mobile'
        if (count > 9) style += ' horizontal'
        return style
    }
    return <div className={getResultDetailsStyle()}>
        <span>{props.result.title}</span>
{/*         <div className='ResultDetailsInfo'>
            
            {props.cover}
        </div> */}
    <div className={getResultDetailsThumbnailsStyle(props.thumblist.length)}>
            {props.thumblist}
        </div>

    </div>
}


export default ResultComponent