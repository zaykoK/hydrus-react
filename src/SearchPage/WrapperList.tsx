import React, { useEffect } from "react";
import { isMobile } from "../styleUtils";
import InfiniteScroll from 'react-infinite-scroller'

interface WrapperListProps {
    thumbs: Array<JSX.Element>;
    loadingProgress: string;
    loaded: boolean;
    type: string;
}

const COMICSTEP = 28 //For now I'm doing multiples of 4 as that's how many fit in row on 1080p screen
const IMAGESTEP = 60

function WrapperList(props: WrapperListProps) {
    const [displayedThumbs, setDisplayedThumbs] = React.useState<Array<JSX.Element>>([])
    const [hasMore, setHasMore] = React.useState(true)
    function getWrapperListStyle() {
        let style = 'WrapperList'
        if (props.type === 'comic') {
            style += ' comic'
        }
        if (isMobile()) {
            style += ' mobile'
        }
        return style
    }

    useEffect(() => {
        if (props.type === 'comic') {
            setDisplayedThumbs(props.thumbs.slice(0, Math.min(COMICSTEP, props.thumbs.length)))
        }
        else {
            setDisplayedThumbs(props.thumbs.slice(0, Math.min(3*IMAGESTEP, props.thumbs.length)))
        }
    }, [props.thumbs])

    function moreData() {
        if (props.type === 'comic') {
            setDisplayedThumbs(props.thumbs.slice(0, Math.min(displayedThumbs.length + COMICSTEP, props.thumbs.length)))
            if (displayedThumbs.length + COMICSTEP >= props.thumbs.length) {
                setHasMore(false)
            }
        }
        else {
            setDisplayedThumbs(props.thumbs.slice(0, Math.min(displayedThumbs.length + IMAGESTEP, props.thumbs.length)))
            if (displayedThumbs.length + IMAGESTEP >= props.thumbs.length) {
                setHasMore(false)
            }
        }
    }

    return ((props.loaded && props.thumbs.length > 0) &&
        <InfiniteScroll
            pageStart={0}
            loadMore={moreData}
            hasMore={hasMore}
            loader={<div className='infiniteLoader' key='infiniteloader'>Loading</div>}
            threshold={250}
            className={getWrapperListStyle()}
        >
            {displayedThumbs}
        </InfiniteScroll>
        || <div className={getWrapperListStyle() + ' loading'}><p>LOADING</p><p>{props.loadingProgress}</p></div>
    );
}

export default WrapperList
export const MemoWrapperList = React.memo(WrapperList)