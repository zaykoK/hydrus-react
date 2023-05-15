import { NavigateFunction } from 'react-router-dom'
import { addTag } from './SearchPage/SearchPageHelpers'
import * as TagTools from './TagTools'
import React, { Fragment, useEffect, useRef, useState } from 'react'

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
    const reference = useRef(null)
    return <Fragment><div
        className='tagEntry blob'
        onClick={() => { addTag(displayTagString(props.tag, true), props.navigate, props.type) }}
        //onContextMenu={(e) => { e.preventDefault(); addTag("-" + displayTagString(props.tag, true), props.navigate, props.type) }}
        onContextMenu={(e) => { e.preventDefault(); setContextVisible(!contextVisible) }}
        key={displayTagString(props.tag)}
        style={TagTools.getTagButtonStyle(props.tag.namespace)} >
        {displayTagString(props.tag, props.visibleNamespace) + displayTagCount(props.tag.count, props.visibleCount)}
        {(contextVisible) ? <ContextMenu
            actions={[{ action: () => { addTag(displayTagString(props.tag, true), props.navigate, props.type) }, label: 'Add Tag' },
            { action: () => { addTag("-" + displayTagString(props.tag, true), props.navigate, props.type) }, label: 'Exclude Tag' },
            { action: () => { console.log("Renaming") }, label: 'Rename Tag' },
            { action: () => { console.log("Remove tag") }, label: 'Remove Tag' },
            ]}
            namespace={props.tag.namespace}
            name={displayTagString(props.tag, true)}
            setVisible={setContextVisible} /> : null}
    </div>
    </Fragment>
}

type ActionTuple = {
    action: Function;
    label: string;
}

interface ContextMenuProps {
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    name: string;
    namespace: string;
    actions: Array<ActionTuple>;

}

/* 



 */
function ContextMenu(props: ContextMenuProps) {
    const reference = useRef<any>(null)

    function setMousePosition(e: MouseEvent) {
        document.documentElement.style.setProperty('--mouse-x', Math.max(100,e.clientX).toString()+'px');
        document.documentElement.style.setProperty('--mouse-y', Math.min(650,e.clientY).toString()+'px');
        console.log(e.clientX,e.clientY)
        document.removeEventListener('mousedown', setMousePosition)
    }




    const [actionList, setActionList] = useState<Array<JSX.Element>>([])

    function createActionList() {
        let actionArray: Array<JSX.Element> = []
        for (let entry of props.actions) {
            actionArray.push(<ContextAction key={entry.label} action={entry} />)
        }
        setActionList(actionArray)
    }

    useEffect(() => {
        if (reference.current !== null) {
            reference.current.focus()
        }
        createActionList()
        document.addEventListener('mousedown', setMousePosition)

    }, [])

    return <div tabIndex={-1} ref={reference} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className='TagContextMenuWrapper' onBlur={(e) => { e.preventDefault; props.setVisible(false) }}>
        <div className='TagContextMenuTitle' style={TagTools.getTagButtonStyle(props.namespace)}>
            {props.name}
        </div>
        {actionList}
        <ContextAction action={{ action: () => { props.setVisible(false) }, label: 'Close Menu' }} />
    </div>
}
interface ContextActionProps {
    action: ActionTuple;
}

function ContextAction(props: ContextActionProps) {
    return <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); props.action.action() }} className='TagContextMenuEntry'>
        {props.action.label}
    </div>

}