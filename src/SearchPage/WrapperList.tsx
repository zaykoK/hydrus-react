import React from "react";
import { isMobile } from "../styleUtils";

interface WrapperListProps {
    thumbs: Array<JSX.Element>;
    loadingProgress: string;
    loaded: boolean;
    type: string;
}

function WrapperList(props: WrapperListProps) {
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


    return ((props.loaded && props.thumbs.length > 0) &&
        <div className={getWrapperListStyle()}>{props.thumbs}</div> || <div className={getWrapperListStyle() + ' +loading'}>LOADING {props.loadingProgress}</div>
    );
}

export default WrapperList
export const MemoWrapperList = React.memo(WrapperList)