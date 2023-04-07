import { useEffect, useRef, useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import * as API from '../hydrus-backend'
import './TagComponentWrapper.css'
import InfiniteScroll from "react-infinite-scroller";
import TagComponent from "./TagComponent";
import GroupButton from "./GroupButton";
import IconExpand from '../assets/fullScreenOn.svg'

interface TagComponentsWrapperProps {
    navigate?: NavigateFunction;
    namespace?: string;
    size?: number;
    limit?: number;
    sortOrder?: number;
    tags?:Array<string>;

}

export function TagComponentsWrapper(props: TagComponentsWrapperProps) {
    const [elements, setElements] = useState<Array<JSX.Element>>([])
    const [displayedElements, setDisplayedElements] = useState<Array<JSX.Element>>([])
    const [hasMore, setHasMore] = useState<boolean>(true)
    const abortController = useRef<AbortController | undefined>()
    const navigate = useNavigate()
    const [active, setActive] = useState<boolean>(false)

    const [large, setLarge] = useState<boolean>(false)

    const [filter, setFilter] = useState<string>('')

    const [sortOrder, setSortOrder] = useState<number>(props.sortOrder || 0)

    function sortByName(tags: Array<API.APITagResponse>) {
        tags.sort((a, b) => {
            if (a.value < b.value) {
                return -1
            }
            if (a.value > b.value) {
                return 1
            }
            return 0
        })
        return tags
    }

    async function loadTags() {
        if (abortController.current) {
            abortController.current.abort()
        }
        abortController.current = new AbortController()

        let tags = await API.getAllTags({
            namespace: props.namespace || '',
            abortController: abortController.current
        })

        let tagElements: Array<JSX.Element> = []

        if (sortOrder === 0) {

        }
        if (sortOrder === 1) {
            sortByName(tags)
        }

        for (let element of tags) {
            tagElements.push(
                <TagComponent key={element.value} tag={element} size={props.size} allowed={true} navigate={navigate} />
            )
        }
        setElements(tagElements)
        setDisplayedElements(tagElements.slice(0, 30))
    }

    useEffect(() => {
        if (props.namespace !== "" || props.namespace !== undefined) {
            loadTags()
        }
    }, [props.namespace,props.tags])

    useEffect(() => {
        const IMAGESTEP = 30
        const filteredElements: Array<JSX.Element> = []
        //console.log(`refiltering with ${filter}`)
        for (let element of elements) {
            if (filter && element.key?.toString().includes(filter)) { filteredElements.push(element) }
        }
        //filteredElements.map((value,index,array) => console.log(value.key))
        setDisplayedElements(filteredElements.slice(0, Math.min(IMAGESTEP, filteredElements.length)))
        setHasMore(true)
    }, [filter])

    function moreData() {
        const IMAGESTEP = 30
        if (filter.length > 0) {
            const filteredElements: Array<JSX.Element> = []
            //console.log(`refiltering with ${filter}`)
            for (let element of elements) {
                if (filter && element.key?.toString().includes(filter)) { filteredElements.push(element) }
            }
            setDisplayedElements(filteredElements.slice(0, Math.min(displayedElements.length + IMAGESTEP, filteredElements.length)))
            if (displayedElements.length + IMAGESTEP >= filteredElements.length) {
                setHasMore(false)
            }
        }
        else {
            if (elements.length === 0) { return }
            setDisplayedElements(elements.slice(0, Math.min(displayedElements.length + IMAGESTEP, elements.length)))
            if (displayedElements.length + IMAGESTEP >= elements.length) {
                setHasMore(false)
            }
        }
    }

    function toggleList() {
        if (large && active) { setLarge(!large) }
        setActive(!active)
    }

    function getListStyle() {
        let style = 'TagComponentsWrapper'
        if (active) { style += ' active' }
        return style
    }

    function filterTag(e: string) {
        setFilter(e.toLowerCase())
    }

    function toggleLarge() {
        if (!active) { setActive(true) }
        setLarge(!large)
    }

    function getTagComponentListWrapperStyle() {
        let style = 'TagComponentListWrapper'
        if (large) { style += ' large' }
        return style
    }

    function getTagComponentListStyle() {
        let style = 'TagComponentList'
        if (large) { style += ' large' }
        return style
    }


    return <div className={getTagComponentListStyle()}>
        <div className="TagComponentListLabel">
            <p onClick={(e) => { if (e.target !== e.currentTarget) { return } else { toggleList() } }}>
                {props.namespace} - {elements.length} Entries </p>
            <input
                type='text'
                onFocus={() => { }}
                onBlur={() => { }}
                className="TagComponentListFilterInput"
                value={filter}
                onChange={(e) => filterTag(e.target.value)} />
            <GroupButton clickAction={toggleLarge} icon={IconExpand} />
        </div>
        <div className={getTagComponentListWrapperStyle()}>
            <InfiniteScroll
                pageStart={0}
                loadMore={moreData}
                hasMore={hasMore}
                loader={<div className='infiniteLoader' onClick={moreData} key='infiniteloader'>Loading... (Click if stuck)</div>}
                threshold={350}
                useWindow={false}
                className={getListStyle()}
            >
                {displayedElements}
            </InfiniteScroll>
        </div>
    </div >
}