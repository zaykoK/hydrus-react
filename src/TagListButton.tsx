import { NavigateFunction } from 'react-router-dom'
import { addTag } from './SearchPage/SearchPageHelpers'
import * as TagTools from './TagTools'

//Add a popup window allowing some advanced tag operations like
//Add tag
//Add tag exclusion
//Add tag as OR to another one

function displayTagString(tag: TagTools.Tuple, full = false): string {
    if (tag.namespace === '') { return tag.value }

    //User toggle whether to show just the tag value => "naruto" or namespace and value => "character:naruto"
    //Eventually move this into props so it doesn't have to access this value on every tag render
    if (full || sessionStorage.getItem('show-tag-namespace') === 'true') {
        return tag.namespace + ":" + tag.value
    }
    return tag.value
}

function displayTagCount(count: number, visible: boolean) {
    if (visible) {
        return ' (' + count + ')'
    }
    return ''
}

interface TagListButtonProps {
    tag: TagTools.Tuple;
    navigate: NavigateFunction;
    type: string;
    visibleCount: boolean;
}

export function TagListButton(props: TagListButtonProps) {
    return <p
        className='tagEntry blob'
        onClick={() => { addTag(displayTagString(props.tag, true), props.navigate, props.type) }}
        onContextMenu={(e) => { e.preventDefault(); addTag("-" + displayTagString(props.tag, true), props.navigate, props.type) }}
        key={displayTagString(props.tag)}
        style={TagTools.getTagButtonStyle(props.tag.namespace)} >
        {displayTagString(props.tag) + displayTagCount(props.tag.count, props.visibleCount)}
    </p>
}
