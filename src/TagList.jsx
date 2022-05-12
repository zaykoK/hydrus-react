import * as TagTools from './TagTools'
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


export function TagList(props) {
    const tagListStyle = {
        padding: '5px',
        margin: '5px',
        overflow: 'scroll',
        minHeight: '50vh',
        maxHeight: '97vh',
        overflowY: 'scroll',
        overflowX: 'hidden'
    }
    const navigate = useNavigate();

    const [tags, setTags] = useState([]);

    function displayTagString(tag) {
        if (tag.namespace === '') { return tag.value }
        return tag.namespace + ':' + tag.value
    }

    function generateSearchURL(tags, page) {
        let parameters = new URLSearchParams({
            page: page
        })
        for (let tag in tags) {
            parameters.append('tags', tags[tag])
        }
        return parameters
    }

    function searchTag(tag) {
        let par = generateSearchURL([tag], 1)

        navigate('/search/' + par)
    }

    function clickHandler(arg) {
        if (props.clickFunction != undefined){
            return props.clickFunction(arg)
        }
        return searchTag(arg)
    }

    function createTagList(args) {
        let tagList = []
        for (let element in args.tags) {
            tagList.push(
                <p
                    onClick={() => { clickHandler(displayTagString(args.tags[element])) }}
                    key={displayTagString(args.tags[element])}
                    style={TagTools.getTagTextStyle(args.tags[element].namespace)} >
                    {displayTagString(args.tags[element])}
                </p>);
        }
        return tagList;
    }
    useEffect(() => {
        setTags(createTagList({ tags: props.tags }))
    }, [props])

    return (
        <div style={tagListStyle}>{tags}</div>
    )
}