import { useEffect, useState } from 'react';
import * as TagTools from '../TagTools'
import './GroupingWindow.css'

interface GroupingWindowProps {
    proposedObject: {
        proposedTitle: string;
        dates: {key:string,value:number}[] | undefined,
        creators: TagTools.Tuple[] | undefined,
        titles: TagTools.Tuple[] | undefined
    } | null;
    exitFunction:Function;
}

function GroupingWindow(props: GroupingWindowProps) {

    const creatorElements = []
    const dateElements = []
    const titleElements = []

    const [selectedCreator,setSelectedCreator] = useState<number>(0)
    const [selectedDate,setSelectedDate] = useState<number>(0)
    const [selectedTitle,setSelectedTitle] = useState<number>(0)


    const [proposedTitle,setProposedTitle] = useState<string>(props.proposedObject?.proposedTitle || '')


    if (props.proposedObject === null) {
        return
    }
    if (props.proposedObject.creators) {
        for (let creator of props.proposedObject.creators) {
            let value = `${creator.value} (${creator.count})`
            creatorElements.push(<p key={value}>{value}</p>)
        }
    }

    if (props.proposedObject.dates) {
        for (let date of props.proposedObject.dates) {
            let value = `${date.key} (${date.value})`
            dateElements.push(<p key={value}>{value}</p>)
        }
    }
    if (props.proposedObject.titles) {
        for (let title of props.proposedObject.titles) {
            let value = `${title.value} (${title.count})`
            titleElements.push(<p key={value}>{value}</p>)
        }
    }

    function editProposedTitle(e:string) {
        setProposedTitle(e)
    }


    return <div className="GroupingWindow" onBlur={() => {props.exitFunction()}}>
        <div className="GroupWindowsTopBar">
            <button onClick={() => {props.exitFunction()}}>X</button>
        </div>
        <div className="GroupingWindowTags">
            <div className="GroupingWindowTagsEntry">
                <div>Creators</div>
                {creatorElements}
            </div>
            <div className="GroupingWindowTagsEntry">
            <div>Date</div>
                {dateElements}
            </div>
            <div className="GroupingWindowTagsEntry">
            <div>Title</div>
                {titleElements}
            </div>
        </div>
        <div className="GroupingWindowNameEntry">
            <input type="text" placeholder="Title" onChange={(e) => {editProposedTitle(e.target.value)}} value={proposedTitle} />
        </div>
    </div>
}

export default GroupingWindow