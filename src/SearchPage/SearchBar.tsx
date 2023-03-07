import { isMobile } from "../styleUtils";
import TagDisplay from "../TagDisplay";
import { TagList } from "../TagList";
import * as API from '../hydrus-backend'
import { useRef, useState } from "react";
import * as TagTools from '../TagTools'
import { useNavigate } from "react-router-dom";
import { addTag } from "./SearchPageHelpers";

import './SearchBar.css'

type TagLookupResult = {
    value: string;
    count: number;
}

const blacklist = JSON.parse(localStorage.getItem('blacklisted-namespaces') || '[]')

function TagLookupResultToTuple(tags: Array<TagLookupResult>, currentSearch: string): Array<TagTools.Tuple> {
    let filteredTags: Array<TagTools.Tuple> = []
    let currentNamespace = currentSearch.split(':', 2)
    for (let tag of tags) {
        let splitted = tag.value.split(':', 2)
        if (splitted.length > 1) {
            if ((!blacklist.includes(splitted[0])) || (splitted[0] === currentNamespace[0])) {
                filteredTags.push({
                    namespace: splitted[0],
                    value: splitted[1],
                    count: tag.count
                })
            }
        }
        else {
            filteredTags.push({
                namespace: '',
                value: splitted[0],
                count: tag.count
            })
        }
    }
    return filteredTags
}

function TagInput(props: { tags: Array<Array<string>>, type: string, infoAction: Function }) {
    const [helpTags, setHelpTags] = useState<Array<TagTools.Tuple>>([])
    const [helpTagsVisible, setHelpTagsVisible] = useState<boolean>(false)
    // Probably I could use useRef for tag so it doesn't re-render everything every letter, but then a lot of other stuff will break
    const [tag, setTag] = useState('')
    const abortController = useRef<AbortController | undefined>()
    const navigate = useNavigate()

    function submitTag(event: React.FormEvent) {
        event.preventDefault(); //necessary to not reload page after submit

        let split = tag.split(' OR ')
        let splitLength = split.length

        //This is technically buggy, as the intent was to sent queries that don't do OR as string but it actually works really nice
        if (splitLength > 0) {
            let inside = []
            for (let i = 0; i < splitLength; i++) {
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
        if (search.length < 2 && JSON.stringify(helpTags) !== JSON.stringify([])) { setHelpTags([]) }
        if (search.length > 1) {
            let response = await API.api_add_tags_search_tags({
                search: search,
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
        if (isMobile()) { return "searchBar mobile" }
        return "searchBar"
    }
    return <div className={getSearchBarStyle()}>
        <TagDisplay key={props.tags.toString()} tags={props.tags} navigate={navigate} type={props.type} />
        <form className="searchForm" onSubmit={submitTag}>
            <input
                onFocus={() => { setHelpTagsVisible(true); props.infoAction(false) }}
                onBlur={() => { setTimeout(() => setHelpTagsVisible(false),150)  }}
                className="searchInput"
                type="text"
                value={tag}
                placeholder="Search tags, -tag excludes, tag1 OR tag2 for alternative"
                onChange={(e) => searchTag(e.target.value)} />
        </form>
        {(tag && helpTagsVisible) ? <div className='emptyButton' onClick={() => setTimeout(() => { setHelpTagsVisible(false); setTag(''); setHelpTags([]) }, 100)}>X</div> : null}
        <div className={getHelpTagsListStyle(helpTagsVisible)}>
            <TagList tags={helpTags} visibleCount={true} type={'image'} searchBar={true} />
        </div>
    </div>
}

export default TagInput