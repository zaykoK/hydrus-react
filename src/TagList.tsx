import * as TagTools from './TagTools'
import { useEffect, useState } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';

import * as API from './hydrus-backend'

import './TagList.css'
import { isMobile } from './styleUtils';

import { TagListButton } from './TagListButton';

interface TabButtonProps {
    service: API.TagRepositoryTuple;
    selectFunction: Function;
    count?: number;
}

function TabButton(props: TabButtonProps) {
    function buttonText(): string {
        let buttonText = ''

        let countText = ''

        if (props.count) {
            countText = ` (${props.count})`
        }

        if (props.service.name === 'all known tags') {
            buttonText = `All Tags${countText}`
        }
        else {
            buttonText = `${props.service.name}${countText}`
        }

        return buttonText
    }
    return <div onClick={() => { props.selectFunction(props.service.service_key) }} className='tabButton'>{buttonText()}</div>
}

function getTagServices(): Array<API.TagRepositoryTuple> {
    // This function grabs tag services in order = all tags, local tags
    let sessionServices: API.ResponseGetService = JSON.parse(sessionStorage.getItem('hydrus-services') || '')
    let services: Array<API.TagRepositoryTuple> = []
    services.push(sessionServices.all_known_tags[0])
    services = services.concat(sessionServices.local_tags)
    return services
}

interface TagListTabsProps {
    tags: Map<string, Array<TagTools.Tuple>>;
    clickFunction?: Function;
    visibleCount: boolean;
    blacklist?: Array<string>; // tag namespaces to skip
    type: string;
    searchBar?: boolean;
    displayTagCount?:boolean;
}

export function TagListTabs(props: TagListTabsProps) {
    const [services, setServices] = useState(getTagServices())
    const [selected, setSelected] = useState("616c6c206b6e6f776e2074616773")

    const hiddenServices = ['Good Tags','zTranslations']

    function createTabButtonsList() {
        let final = []
        for (let entry of services) {
            if (!hiddenServices.includes(entry.name)) {
                final.push(<TabButton
                    key={"TagTabButton" + entry.service_key}
                    count={(props.displayTagCount) ? props.tags.get(entry.service_key)?.length : undefined}
                    selectFunction={setSelected} service={entry} />)
            }
        }
        return final
    }

    function createTagLists() {
        let lists = []
        for (let entry of services) {
            if (!hiddenServices.includes(entry.name)) {
                let elementTags = props.tags.get(entry.service_key)
                lists.push((selected === entry.service_key) ? (elementTags?.length !== 0) ? 
                <TagList
                    key={"tagList" + entry.service_key}
                    searchBar={props.searchBar}
                    tags={props.tags.get(entry.service_key) || []}
                    visibleCount={true} type={props.type}
                    blacklist={props.blacklist} />
                     : <div className="emptyList" />
                 : null)
            }

        }

        return lists
    }

    return <>
        <div key="tagListTabSelector" className='tabSelectors'>
            {createTabButtonsList()}
        </div>
        {/* <div key="tagListAddTagRow" className='tagListAddTagRow'>
            <p>Add Tag(+)</p>
        </div> */}
        <div key="tagListTabContent" className='tagContentSection'>
            {createTagLists()}
        </div>
    </>
}


interface TagListProps {
    tags: Array<TagTools.Tuple>;
    clickFunction?: Function;
    visibleCount: boolean;
    blacklist?: Array<string>; // tag namespaces to skip
    type: string;
    searchBar?: boolean;
}

export function TagList(props: TagListProps) {
    const navigate = useNavigate();
    const [tags, setTags] = useState<Array<JSX.Element>>([]);

    function getTagListStyle() {
        let style = 'tagList'
        if (props.searchBar) { style = 'tagListSearchBar' }
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
                tagList.push(<TagListButton
                    key={tuples[element].namespace + ':' + tuples[element].value}
                    tag={tuples[element]} navigate={navigate}
                    type={props.type}
                    visibleCount={props.visibleCount} />)
            }
        }
        return tagList;
    }
    useEffect(() => {
        setTags(createTagList(props.tags, props.blacklist || []))
    }, [props])

    return (tags.length > 0) ? <div className={getTagListStyle()}>{tags}</div> : null

}

