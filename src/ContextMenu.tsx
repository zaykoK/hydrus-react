import { useEffect, useRef, useState } from "react";
import * as TagTools from './TagTools';

type ActionTuple = {
    action: Function;
    label: string;
}

interface ContextMenuProps {
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    name: string;
    namespace: string;
    actions: Array<ActionTuple>;
    autoclose?: boolean;
    coordinates?: { x: number, y: number };

}

/* 



 */
function ContextMenu(props: ContextMenuProps) {
    const reference = useRef<any>(null)
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
    }, [])

    const coordinatesStyle = {
        left: Math.min(props.coordinates?.x || 0,window.innerWidth - 250), top: Math.min(props.coordinates?.y || 0,window.innerHeight - 300)
    }

    return (true) ? <div style={coordinatesStyle} tabIndex={-1} ref={reference} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className='TagContextMenuWrapper'
        onBlur={(e) => {
            e.preventDefault;
            if (props.autoclose) {
                props.setVisible(false)
            }
        }}>
        <div className='TagContextMenuTitle' style={TagTools.getTagButtonStyle(props.namespace)}>
            {props.name}
        </div>
        {actionList}
        <ContextAction action={{ action: () => { props.setVisible(false) }, label: 'Close Menu' }} />
    </div> : null
}
interface ContextActionProps {
    action: ActionTuple;
}

function ContextAction(props: ContextActionProps) {
    return <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); props.action.action() }} className='TagContextMenuEntry'>
        {props.action.label}
    </div>

}

export default ContextMenu