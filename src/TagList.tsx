import * as TagTools from './TagTools'
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './TagList.css'
import { isMobile } from './styleUtils';

import { addTag, removeTag } from './SearchPage/SearchPageHelpers'

interface TagListProps {
    tags: Array<TagTools.Tuple>;
    clickFunction?: Function;
    visibleCount: boolean;
    blacklist?: Array<string>; // tag namespaces to skip
    type: string;
}

export function TagList(props: TagListProps) {
    const navigate = useNavigate();
    const [tags, setTags] = useState<Array<JSX.Element>>([]);

    function displayTagString(tag: { namespace: string, value: string }): string {
        if (tag.namespace === '') { return tag.value }

        //User toggle whether to show just the tag value => "naruto" or namespace and value => "character:naruto"
        //Eventually move this into props so it doesn't have to access this value on every tag render
        if (sessionStorage.getItem('show-tag-namespace') === 'true') {
            return tag.namespace + ":" + tag.value
        }
        return tag.value
    }

    function generateSearchURL(tags: Array<string>, page: number) {
        let parameters = new URLSearchParams({
            page: page.toString()
        })
        for (let tag in tags) {
            parameters.append('tags', tags[tag])
        }
        return parameters
    }

    function searchTag(tag: string) {
        let par = generateSearchURL([tag], 1)

        navigate('/search/' + par)
    }

    function clickHandler(tag: string) {
        if (props.clickFunction != undefined) {
            return props.clickFunction(tag)
        }
        return searchTag(tag)
    }

    function displayTagCount(count: number) {
        if (props.visibleCount) {
            return ' (' + count + ')'
        }
        return ''
    }

    function getTagListStyle() {
        let style = 'tagList'
        if (isMobile()) {
            style += " mobile"
        }
        return style
    }

    function createTagList(args: { tags: Array<TagTools.Tuple>, blacklist: Array<string> }) {
        let tagList = []

        let currentNamespace = ''

        for (let element in args.tags) {
            //At this point all the list should be sorted by namespaces meaning I can have a current namespace value


            //Don't display tags in certain namespaces like titles,page etc on overall list
            if (!args.blacklist.includes(args.tags[element].namespace)) {
                tagList.push(
                    <p
                        className='tagEntry blob'
                        onClick={() => { addTag(displayTagString(args.tags[element]), navigate, props.type) }}
                        onContextMenu={(e) => { e.preventDefault(); addTag("-" + displayTagString(args.tags[element]), navigate, props.type) }}
                        key={displayTagString(args.tags[element])}
                        style={TagTools.getTagButtonStyle(args.tags[element].namespace)} >
                        {displayTagString(args.tags[element]) + displayTagCount(args.tags[element].count)}
                    </p>);
            }
        }
        return tagList;
    }
    useEffect(() => {
        setTags(createTagList({ blacklist: props.blacklist || [], tags: props.tags }))
    }, [props])

    return (
        (tags.length > 0) && <div className={getTagListStyle()}>{tags}</div> || <></>
    )
}