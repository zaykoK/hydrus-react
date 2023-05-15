import { NavigateFunction } from "react-router-dom"
import * as API from '../hydrus-backend';
import * as TagTools from '../TagTools';
import { APIResponseGetService, MetadataResponse } from "../MetadataResponse";

/** Generates a URLSearchParams from tag array and page number */
export function generateSearchURL(tags: Array<Array<string>> | undefined, page: number, hash: string, type: string): URLSearchParams {
    let parameters = new URLSearchParams({
        page: page.toString(),
        hash: hash,
        type: type
    })
    //If tags exist and are not equal to one empty array element
    if (tags && !(tags.length === 1 && JSON.stringify(tags[0]) === JSON.stringify([]))) {
        //For each of the tags turn them from array into a string form
        //Essentialy [['tag1','tag2'],['tag3']] => tags=tag1 OR tag2&tags=tag3
        for (let element of tags) {
            let tagString = ''
            let innerArray = element
            for (let innerElement of innerArray) {
                tagString += innerElement + ' OR '
            }
            tagString = tagString.slice(0, -4)
            //Potential replacements that will be necessary
            // &
            // +
            // /
            // \
            // :
            //Question is which one are already replaced by URLEncode
            //So far those 2 definetely broke searches
            //Decoding happens in SearchPage readParams function
            tagString = tagString.replace('&', '!ANDS')
            tagString = tagString.replace('+', '!PLUSSYMBOL')
            //tagString = tagString.replace('/', '!FRWDSLASH')
            //tagString = tagString.replace('\\', '!BCKSLASH')
            //tagString = tagString.replace(':', '!DDOTS')

            parameters.append('tags', tagString)
        }
    }
    return parameters
}

export function navigateTo(parameters: URLSearchParams, navigate: NavigateFunction, type: string = 'image') {
    switch (type) {
        case 'image':
            navigate('/search/' + parameters)
            break
        case 'comic':
            navigate('/comics/' + parameters)
            break
        default:
            navigate('/search/' + parameters)
            break
    }
}

export function getRecentTags() {
    let tags = sessionStorage.getItem('recent-tags')
    if (tags === null) {
        return []
    }
    let returned:Array<string> = JSON.parse(tags)
    return returned
}

function saveRecentTags(tags:Array<string>) {
    sessionStorage.setItem('recent-tags',JSON.stringify(tags))
}

function pushToRecentTags(tag:string,tags?:Array<string>) {
    let recentTags:Array<string> = []
    if (tags) {
        recentTags = tags;
    }
    else {
        recentTags = getRecentTags()
    }
    recentTags.push(tag)

    saveRecentTags(recentTags)


}


export function addTag(addedTags: Array<string> | string, navigate: NavigateFunction, pageType: string): void {
    let currentSearchTags: Array<Array<string>> = JSON.parse(sessionStorage.getItem('current-search-tags') || '[]')

    let recentTags: Array<string> = getRecentTags()

    let currentHash = sessionStorage.getItem('currently-displayed-hash') || ''

    //If it so happens that tag is string put it into array
    if (typeof addedTags === 'string') {
        addedTags = [addedTags]
    }

    if (currentSearchTags) {
        //If it's only a single empty string
        if (addedTags[0] === '') { return }
        let newTags = currentSearchTags.slice(); //This gives me copy of tags array instead of pointing to array, needed for update process

        for (let entry of newTags) {
            if (JSON.stringify(entry) === JSON.stringify(addedTags)) { console.log('found tag already exists'); return }
        }

        //TODO process certain unique tags that user shouldn't be able to add
        newTags.push(addedTags);

        for (let entry of addedTags) {
            pushToRecentTags(entry,recentTags)
        }

        //TODO - This entire pageType thing needs to change, I should move it into generateSearchURL
        let generatedParameters = generateSearchURL(newTags, 1, currentHash, pageType)
        navigateTo(generatedParameters, navigate, pageType)
    }
}

export function removeTag(removedTags: Array<string>, navigate: NavigateFunction, pageType: string) {
    let currentSearchTags:Array<Array<string>> = JSON.parse(sessionStorage.getItem('current-search-tags') || '[]')

    let currentHash = sessionStorage.getItem('currently-displayed-hash') || ''

    if (currentSearchTags) {
        let i = 0;
        let stringified = JSON.stringify(removedTags)
        for (let entry in currentSearchTags) {
            if (JSON.stringify(currentSearchTags[entry]) === stringified) {
                //console.log('found the tag ' + stringified + ' its on position' + entry)
                i = parseInt(entry)
                break
            }
        }

        if (i === -1) {
            console.warn("Didn't find tag " + removedTags + ' inside ' + currentSearchTags)
            return
        }
        let afterRemove = currentSearchTags?.slice();
        afterRemove.splice(i, 1);

        let generatedParameters = generateSearchURL(afterRemove, 1, currentHash, pageType)
        navigateTo(generatedParameters, navigate, pageType)
    }
}

function mergeTagMaps(current: Map<string, Array<string>>, second: Map<string, Array<string>>) {
    second.forEach((value, key) => {
        let currentValue = current.get(key)
        if (currentValue === undefined) {
            //console.log(value)
            //console.log(value.slice(0))
            current.set(key, value.slice(0))
        }
        else {
            //console.log(currentValue)
            currentValue.push(...value.slice())
            //console.log(currentValue)
            //current.set(key, currentValue.concat(value))
        }
    })
}

export function loadServiceData():APIResponseGetService|null {
    let sessionData = sessionStorage.getItem('hydrus-services')
    
    if (sessionData === null) {
        console.warn('No service data in memory, try refreshing.')
        return null
    }
    let servicesData:APIResponseGetService = JSON.parse(sessionData)
    return servicesData
}

export function createListOfUniqueTags(responses: Array<MetadataResponse>): Map<string, Array<TagTools.Tuple>> {
    let merged: Map<string, Array<string>> = new Map()

    let servicesData = loadServiceData()
    if (servicesData === null) {return new Map()}

    // TODO
    // This thing is slow, ~250ms on my pc with 5000 result limit
    // Was way slower initially with merge using [...array,secondArray].flat() => ~10 seconds
    // Find a way to make it faster
    // Changed to push which seems to made it take only round ~50ms now with same data set
    // Last thing that is slow the actual getTagsFromMetadata which now is 90% of time spent
    // It was actually because I was parsing JSON with services 5000 times
    // Now it's a nice ~5ms

    //console.time('merge')
    for (let element of responses) {
        let tags = API.getTagsFromMetadata(element, 'all known tags',servicesData)
        mergeTagMaps(merged, tags)
    }
    //console.timeEnd('merge')

    //console.time('secondChrist')
    let final: Map<string, Array<TagTools.Tuple>> = new Map()
    merged.forEach((value, key) => {
        let tagMap: Map<string, number> = TagTools.tagArrayToMap(value)
        let tuple = TagTools.transformIntoTuple(tagMap)
        tuple.sort((a, b) => TagTools.compareNamespaces(a, b))
        final.set(key, tuple)
    })
    //console.timeEnd('secondChrist')
    return final
}

export function getAllTagsServiceKey():string {
    let services:APIResponseGetService = JSON.parse( sessionStorage.getItem('hydrus-services') || '')
    let allKnownTags = services.all_known_tags[0].service_key

    return allKnownTags
}

export function getTagsFromService(serviceKey:string) {

}

export function responseSizeToString(responseSize:number):string {
    if (responseSize > 1024 * (512)) { //MB
      return (responseSize * 2).toLocaleString().slice(0, -5) + ' MB'
    }
    else if (responseSize > 512) { //KB
      return (responseSize * 2).toLocaleString().slice(0, -5) + ' kB'
    }
    else {
      return (responseSize * 2).toLocaleString() + ' B'
    }
  }


