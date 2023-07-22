import { NavigateFunction } from 'react-router-dom'
import { addTag } from './SearchPage/SearchPageHelpers'
import * as TagTools from './TagTools'
import React, { Fragment, useEffect, useRef, useState } from 'react'
import ContextMenu from './ContextMenu'
import { createPortal } from 'react-dom'

//Add a popup window allowing some advanced tag operations like
//Add tag
//Add tag exclusion
//Add tag as OR to another one

function displayTagString(tag: TagTools.Tuple, full = false): string {
    //User toggle whether to show just the tag value => "naruto" or namespace and value => "character:naruto"
    //Eventually move this into props so it doesn't have to access this value on every tag render
    if (full) {
        if (tag.namespace === '') { return tag.value }
        return `${tag.namespace}:${tag.value}`
    }
    return tag.value
}

function displayTagCount(count: number, visible: boolean) {
    if (visible) {
        return ` (${count})`
    }
    return ``
}

interface TagListButtonProps {
    tag: TagTools.Tuple;
    navigate: NavigateFunction;
    type: string;
    visibleCount: boolean;
    visibleNamespace: boolean;
}

export function TagListButton(props: TagListButtonProps) {
    const [contextVisible, setContextVisible] = useState<boolean>(false)
    const [contextCoordinates, setContextCoordinates] = useState<{ x: number, y: number }>({ x: 0, y: 0 })
    const reference = useRef(null)





    return <Fragment><div
        className='tagEntry blob'
        onClick={() => { addTag(displayTagString(props.tag, true), props.navigate, props.type) }}
        //onContextMenu={(e) => { e.preventDefault(); addTag("-" + displayTagString(props.tag, true), props.navigate, props.type) }}
        onContextMenu={(e) => {
            e.preventDefault();
            setContextCoordinates({ x: e.clientX, y: e.clientY })
            setContextVisible(!contextVisible)
        }}
        key={displayTagString(props.tag)}
        style={TagTools.getTagButtonStyle(props.tag.namespace)} >
        {displayTagString(props.tag, props.visibleNamespace) + displayTagCount(props.tag.count, props.visibleCount)}
        {(contextVisible) ? createPortal(<ContextMenu
            coordinates={contextCoordinates}
            actions={[{ action: () => { addTag(displayTagString(props.tag, true), props.navigate, props.type) }, label: 'Add Tag' },
            { action: () => { addTag("-" + displayTagString(props.tag, true), props.navigate, props.type) }, label: 'Exclude Tag' },
            { action: () => { console.log("Renaming") }, label: 'Rename Tag' },
            { action: () => { console.log("Remove tag") }, label: 'Remove Tag' },
            ]}
            namespace={props.tag.namespace}
            autoclose={true}
            name={displayTagString(props.tag, true)}
            setVisible={setContextVisible} />, document.body) : null}
    </div>
    </Fragment>
}
