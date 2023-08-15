import { isMobile } from "../styleUtils";
import TagDisplay from "../TagDisplay";
import { TagList } from "../TagList";
import * as API from '../hydrus-backend'
import { useRef, useState } from "react";
import * as TagTools from '../TagTools'
import { useNavigate } from "react-router-dom";
import { addTag, getRecentTags } from "./SearchPageHelpers";

import './SearchBar.css'
import { tagArrayToMap, transformIntoTuple } from "../TagTools";

type TagLookupResult = {
    value: string;
    count: number;
}

const blacklist = JSON.parse(localStorage.getItem('blacklisted-namespaces') || '[]')

function TagLookupResultToTuple(tags: Array<TagLookupResult>, currentSearch: string): Array<TagTools.Tuple> {
    let filteredTags: Array<TagTools.Tuple> = []
    let currentNamespace = currentSearch.split(':', 2)
    for (let tag of tags) {

        // TODO 
        // Move this into a separate function for tag value parsing or something
        let [first, ...rest ] = tag.value.split(':')
        let splitted:Array<string> = []
        splitted[0] = first
        if (rest.length > 0) {
            splitted[1] = rest.join(':')
        }

        // END
        const isNotSearchingForNamespacedTag = currentNamespace.length === 1
        if (splitted.length > 1) {
            const isNotBlacklisted = !blacklist.includes(splitted[0])
            const isSameNamespaceAsSearched = splitted[0] === currentNamespace[0]
            

            if (isSameNamespaceAsSearched || (isNotSearchingForNamespacedTag && isNotBlacklisted)) {
                filteredTags.push({
                    namespace: splitted[0],
                    value: splitted[1],
                    count: tag.count
                })
            }
        }
        else {
            // If there is a namespace in search but tag doesn't have one, skip it
            //console.log(!currentNamespace[1])
            if (isNotSearchingForNamespacedTag) {
                filteredTags.push({
                    namespace: '',
                    value: splitted[0],
                    count: tag.count
                })
            }
        }
    }
    return filteredTags
}

interface TagInputProps {
    tags: Array<Array<string>>
    type: string
    infoAction: Function
}


function TagInput(props: TagInputProps) {
    const [helpTags, setHelpTags] = useState<Array<TagTools.Tuple>>([])
    const [helpTagsVisible, setHelpTagsVisible] = useState<boolean>(false)
    // Probably I could use useRef for tag so it doesn't re-render everything every letter, but then a lot of other stuff will break
    const [tag, setTag] = useState('')
    const abortController = useRef<AbortController | undefined>()
    const navigate = useNavigate()

    // More or less the properly working idea
    // Reverse "necessary" for easy updating of ordering when tag gets searched again
    const recentTags = transformIntoTuple(tagArrayToMap(getRecentTags().reverse()))

    function submitTag(event: React.FormEvent) {
        event.preventDefault(); //necessary to not reload page after submit

        let split = tag.split(' OR ')

        //This is technically buggy, as the intent was to sent queries that don't do OR as string but it actually works really nice
        if (split.length > 0) {
            let inside = []
            for (let i = 0; i < split.length; i++) {
                inside.push(split[i].toLowerCase())
            }
            addTag(inside, navigate, props.type)
        }
        else {
            console.log('do i go here ever?')
            addTag(tag, navigate, props.type)
        }
        setTag('');
    }

    //At some point should show autocomplete results
    async function searchTag(search: string) {
        setTag(search)
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController()

        //Don't search anything if less than 3 letters are written, this really improves performance as you don't wait for potentially dozens of thousands of results, that just 1 or 2 letters will give, this does create a bit of an issue for two or less letter words like "pi" or "character:l" (from death note)
        //Also clear search if less than 3 letters are typed in
        if (search.length < 2 && helpTags.length !== 0) { setHelpTags([]) }
        if (search.length > 1) {
            let sentSearch = search
            const lastCharacterIsColon = sentSearch.slice(-1) === ':'
            if (lastCharacterIsColon) { sentSearch += '*'}
            let response = await API.api_add_tags_search_tags({
                search: sentSearch,
                abortController: abortController.current
            }).catch((reason) => { return })
            //let rsp2 = API.getAllTags({namespace:'creator',abortController:abortController.current})
            /// Process the results
            if (response) {
                let tags: Array<TagLookupResult> = response.data.tags
                let filteredTags: Array<TagTools.Tuple> = TagLookupResultToTuple(tags, search)
                setHelpTags(filteredTags)
            }
        }
    }

    function getHelpTagsListStyle(visible: boolean) {
        let style = 'HelpTagsListOverlay'
        if (visible) { style += ' visible' }
        if (isMobile()) { style += ' mobile' }
        return style
    }

    function getSearchBarStyle() {
        let style = "searchBar"
        if (isMobile()) { style += " mobile" }
        return style
    }

    function getRecommendedTagsStyle() {
        let style = 'recommendedTags'
        if (isMobile()) { style += ' mobile'}
        return style
    }

    return <div className={getSearchBarStyle()}>
        <TagDisplay key={props.tags.toString()} tags={props.tags} navigate={navigate} type={props.type} />
        <form className="searchForm" onSubmit={submitTag}>
            <input
                onFocus={() => { setHelpTagsVisible(true); props.infoAction(false) }}
                onBlur={() => { setTimeout(() => setHelpTagsVisible(false), 150) }}
                className="searchInput"
                type="text"
                value={tag}
                placeholder="Search tags, -tag excludes, tag1 OR tag2 for alternative"
                onChange={(e) => searchTag(e.target.value)} />
        </form>
        {(tag && helpTagsVisible) ? <div className='emptyButton' onClick={() => setTimeout(() => { setHelpTagsVisible(false); setTag(''); setHelpTags([]) }, 100)}>X</div> : null}
        <div className={getHelpTagsListStyle(helpTagsVisible)}>
            {(helpTags.length === 0) ? <div className="recommendedTagsContainer">
                <div className={getRecommendedTagsStyle()}>
                    <p>Rating</p>
                    <TagList keyPrefix="recRating" tags={[{ namespace: 'rating', value: 'safe', count: 0 }, { namespace: 'rating', value: 'questionable', count: 0 }, { namespace: 'rating', value: 'explicit', count: 0 },]} visibleCount={false} type={'image'} searchBar={true} />
                </div>
                <div className={getRecommendedTagsStyle()}>
                    <p>Medium</p>
                    <TagList keyPrefix="recMedium" tags={[{ namespace: 'medium', value: '2d', count: 0 }, { namespace: 'medium', value: '3d', count: 0 }, { namespace: 'medium', value: 'photo', count: 0 }]} visibleCount={false} type={'image'} searchBar={true} />
                </div>
                {(recentTags.length === 0) ? null : <div className={getRecommendedTagsStyle()}>
                    <p>Recent</p>
                    <TagList keyPrefix="recRecent" tags={recentTags} visibleCount={false} type={'image'} searchBar={true} />
                </div>}
            </div> : null}
            <TagList keyPrefix="recHelp" tags={helpTags} visibleCount={true} type={'image'} searchBar={true} />
        </div>
    </div>
}

export default TagInput