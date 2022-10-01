import * as TagTools from './TagTools'
import { useEffect, useState } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';

import './TagList.css'
import { isMobile } from './styleUtils';

import { TagListButton } from './TagListButton';

interface TagListProps {
    tags: Array<TagTools.Tuple>;
    clickFunction?: Function;
    visibleCount: boolean;
    blacklist?: Array<string>; // tag namespaces to skip
    type: string;
    searchBar?:boolean;
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

