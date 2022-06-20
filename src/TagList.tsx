import * as TagTools from './TagTools'
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

//Props
//Blacklist - tag namespaces to skip
//Tags - tag list
//clickFunction - function to run on clicking tag
interface TagListProps {
    tags: Array<TagTools.Tuple>;
    mobile:boolean;
    clickFunction?: Function;
    visibleCount: boolean;
    blacklist: Array<string>;
}



export function TagList(props:TagListProps) {

    const navigate = useNavigate();

    const [tags, setTags] = useState<Array<JSX.Element>>([]);

    function displayTagString(tag:{namespace:string,value:string}):string {
        if (tag.namespace === '') { return tag.value }
        return tag.namespace + ':' + tag.value
    }

    function generateSearchURL(tags:Array<string>, page:number) {
        let parameters = new URLSearchParams({
            page: page.toString()
        })
        for (let tag in tags) {
            parameters.append('tags', tags[tag])
        }
        return parameters
    }

    function searchTag(tag:string) {
        let par = generateSearchURL([tag], 1)

        navigate('/search/' + par)
    }

    function clickHandler(tag:string) {
        if (props.clickFunction != undefined) {
            return props.clickFunction(tag)
        }
        return searchTag(tag)
    }

    function displayTagCount(count:number) {
        if (props.visibleCount) {
            return ' (' + count + ')'
        }
        return ''
    }

    function getTagListStyle(mobile:boolean) {
        if (mobile) {
            return {
                padding: '5px',
                margin: '5px',
                minHeight: 'auto',
                maxHeight: '75vh',
                overflowY: 'auto',
                overflowX: 'hidden',
                fontSize: '1.1em'
            } as React.CSSProperties
        }
        return {
            padding: '5px',
            margin: '5px',
            minHeight: '50vh',
            maxHeight: '92vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            fontSize: '12px'
        } as React.CSSProperties
    }

    function createTagList(args:{tags:Array<TagTools.Tuple>,blacklist:Array<string>}) {
        let tagList = []
        for (let element in args.tags) {
            //Don't display tags in certain namespaces like titles,page etc on overall list
            if (!args.blacklist.includes(args.tags[element].namespace)) {
                tagList.push(
                    <p
                        onClick={() => { clickHandler(displayTagString(args.tags[element])) }}
                        key={displayTagString(args.tags[element])}
                        style={TagTools.getTagTextStyle(args.tags[element].namespace)} >
                        {displayTagString(args.tags[element]) + displayTagCount(args.tags[element].count)}
                    </p>);
            }
        }
        return tagList;
    }
    useEffect(() => {
        setTags(createTagList({ blacklist: props.blacklist, tags: props.tags }))
    }, [props])

    return (
        <div style={getTagListStyle(props.mobile)}>{tags}</div>
    )
}