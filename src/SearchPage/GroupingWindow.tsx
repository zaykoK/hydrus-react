import { useEffect, useState } from 'react';
import * as TagTools from '../TagTools'
import './GroupingWindow.css'
import * as API from '../hydrus-backend'
import { SelectedResult } from './ImageWall';

interface GroupingWindowProps {
    proposedObject: {
        proposedTitle: string;
        dates: {key:string,value:number}[] | undefined,
        creators: TagTools.Tuple[] | undefined,
        titles: TagTools.Tuple[] | undefined
    } | null;
    exitFunction:Function;
    hashes:SelectedResult[];
}

function GroupingWindow(props: GroupingWindowProps):JSX.Element {

    const creatorElements = []
    const dateElements = []
    const titleElements = []

    const [selectedCreator,setSelectedCreator] = useState<number>(0)
    const [selectedDate,setSelectedDate] = useState<number>(0)
    const [selectedTitle,setSelectedTitle] = useState<number>(0)


    const [proposedTitle,setProposedTitle] = useState<string>(props.proposedObject?.proposedTitle || '')


    if (props.proposedObject === null) {
        return <></>
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

    async function addTagFunction(tags:string[]) {
        let hashes:string[]=[]
        for (let result of props.hashes) {
            hashes.push(result.hash)
        }
        console.log(hashes)
        console.log(`Adding ${tags} to ${hashes.length} files`)

        let response = await API.add_tags_add_tags({
            hashes: hashes,
            service_keys_to_actions_to_tags: {
                "6c6f63616c2074616773":{
                    0:tags
                }
            }
        })
        console.log(response)
        if (response.status === 200) {props.exitFunction()}
    }


    return <div className="GroupingWindow" /* onBlur={(e) => {if (!e.currentTarget.contains(e.relatedTarget)) { props.exitFunction()}}} */>
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
        <div>
            <button onClick={() => {addTagFunction([proposedTitle])}}>Add Tag</button>
        </div>
    </div>
}

export default GroupingWindow