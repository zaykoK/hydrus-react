import React from "react";
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
    //let thumblist: Array<JSX.Element> = []
    //let thumblist.lenght = props.result.subgroups.size

    const [thumblist, setThumblist] = React.useState<Array<JSX.Element>>([])
    const [scrollable, setScrollable] = React.useState<boolean>(false)
    const [cover, setCover] = React.useState<JSX.Element>(<></>)


    React.useEffect(() => {
        let tempThumbs: Array<JSX.Element> = []
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
            if (tLength > 2) {
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
                if (entries.length > 2) {
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
                }
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
        if (size === 2) {
            style += ' duo'
        }
        if (size > 2 && size < 9) {
            style += ' bigger'
        }
        if (size > 8 && size < 16) {
            style += ' bigger threes'
        }
        if (size > 15) {
            style += ' bigger threes' // fours
        }
        if (props.result.type === 'comic') {
            style += ' comic'
        }
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
        if (size === 2) {
            style += ' duo'
        }
        if (size > 2 && size < 9) {
            style += ' bigger'
        }
        if (size > 8 && size < 16) {
            style += ' bigger threes'
        }
        if (size > 15) {
            style += ' bigger threes' // fours
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
        if (thumblist.length > 2) {
            return thumblist.length.toString()
        }
        return ''

    }

    return <div onMouseLeave={(e) => { setScrollable(false); }} onMouseEnter={(e) => { }} onClick={(e) => { e.stopPropagation(); setScrollable(true); }} className={getComponentStyle(thumblist.length)}>
        <div className={getWrapperComponentStyle(thumblist.length, scrollable)}>{thumblist}</div>
        <div className='ResultComponentCover'>
            {(thumblist.length > 2) ? <div className='ResultComponentTopBar'>{getTopText()}</div>:<></>}
            {cover}
            <div className="ResultComponentCountWidget">{getResultCount()}</div>
        </div>
    </div>
}
export default ResultComponent