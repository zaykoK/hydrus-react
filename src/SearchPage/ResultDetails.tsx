import { NavigateFunction } from "react-router-dom";
import { ResultGroup } from "./ResultGroup";
import { isMobile } from "../styleUtils";

interface ResultDetailsProps {
    result: ResultGroup;
    navigate: NavigateFunction;
    cover: JSX.Element | null;
    thumblist: Array<JSX.Element>;
}

function ResultDetails(props: ResultDetailsProps) {
    function getResultDetailsStyle(): string {
        let style = 'ResultDetails'
        if (isMobile()) style += ' mobile'
        return style
    }
    function getResultDetailsThumbnailsStyle(count: number): string {
        let style = 'ResultDetailsThumbnails'
        if (isMobile()) style += ' mobile'
        if (count > 9) style += ' horizontal'
        return style
    }
    return <div className={getResultDetailsStyle()}>
        <div className='ResultDetailsInfo'>
            <span>{isMyTitleScheme(props.result.title)}</span>
        </div>

        {/*         <div className='ResultDetailsInfo'>
            
            {props.cover}
        </div> */}
        <div className={getResultDetailsThumbnailsStyle(props.thumblist.length)}>
            {props.thumblist}
        </div>

    </div>
}

export function isMyTitleScheme(title:string) {
    //This regex is supposed to match '[{creatorName}] {year} {month} '
    const replacementRegex = /\[(.*?)\] [0-9]{4} [0-9]{2}/

    return title.replace(replacementRegex, '')
}


export default ResultDetails