import React, { useEffect } from "react";
import { isMobile } from "../styleUtils";

import InfiniteScroll from 'react-infinite-scroller'


interface WrapperListProps {
    thumbs: Array<JSX.Element>;
    loadingProgress: string;
    loaded: boolean;
    type: string;
}

function WrapperList(props: WrapperListProps) {
    const [displayedThumbs,setDisplayedThumbs] = React.useState<Array<JSX.Element>>([])
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
    // <div className={getWrapperListStyle()}>{props.thumbs}</div> 

    useEffect(() => {
        if (props.type === 'comic') {
            setDisplayedThumbs(props.thumbs.slice(0,Math.min(25,props.thumbs.length)))
        }
        else{
            setDisplayedThumbs(props.thumbs.slice(0,Math.min(150,props.thumbs.length)))
        }
        
    },[props.thumbs])

    function moreData() {
        if (props.type === 'comic') {
            setDisplayedThumbs(props.thumbs.slice(0,Math.min(displayedThumbs.length + 25,props.thumbs.length)))
            if (displayedThumbs.length + 25 >= props.thumbs.length) {
                setHasMore(false)
            }
        }
        else {
            setDisplayedThumbs(props.thumbs.slice(0,Math.min(displayedThumbs.length + 50,props.thumbs.length)))
            if (displayedThumbs.length + 50 >= props.thumbs.length) {
                setHasMore(false)
            }
        }

    }

    return ((props.loaded && props.thumbs.length > 0) &&
        <InfiniteScroll
        pageStart={0}
        loadMore={moreData}
        hasMore={hasMore}
        loader={<div key='infiniteloader'>Loading</div>}
        threshold={150}
        className={getWrapperListStyle()}
        >
        {displayedThumbs}
        </InfiniteScroll>
       || <div className={getWrapperListStyle() + ' +loading'}>LOADING {props.loadingProgress}</div>
    );
}

export default WrapperList
export const MemoWrapperList = React.memo(WrapperList)