import * as TagTools from './TagTools'
import { useEffect, useState } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';

import './TagList.css'
import { isMobile } from './styleUtils';

import { addTag, removeTag } from './SearchPage/SearchPageHelpers'

interface TagListProps {
    tags: Array<TagTools.Tuple>;
    clickFunction?: Function;
    visibleCount: boolean;
    blacklist?: Array<string>; // tag namespaces to skip
    type: string;
    searchBar?:boolean;
}

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

export function TagList(props: TagListProps) {
    const navigate = useNavigate();
    const [tags, setTags] = useState<Array<JSX.Element>>([]);

    function getTagListStyle() {
        let style = 'tagList'
        if (props.searchBar) {style = 'tagListSearchBar'}
        if (isMobile()) {
            style += " mobile"
        }
        return style
    }

    function createTagList(tuples: Array<TagTools.Tuple>, blacklist: Array<string>) {
        let tagList = []
        let currentNamespace = ''

        for (let element in tuples) {
            //At this point all the list should be sorted by namespaces meaning I can have a current namespace value

            //Don't display tags in certain namespaces like titles,page etc on overall list
            if (!blacklist.includes(tuples[element].namespace)) {
                tagList.push(<TagListButton tag={tuples[element]} navigate={navigate} type={props.type} visibleCount={props.visibleCount} />)
            }
        }
        return tagList;
    }
    useEffect(() => {
        setTags(createTagList(props.tags, props.blacklist || []))
    }, [props])

    return (tags.length > 0) ? <div className={getTagListStyle()}>{tags}</div> : <></>

}

//Add a popup window allowing some advanced tag operations like
//Add tag
//Add tag exclusion
//Add tag as OR to another one

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

