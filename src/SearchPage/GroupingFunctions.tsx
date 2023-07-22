import { CacheAxiosResponse } from 'axios-cache-interceptor/dist/cache/axios.js'
import { APIResponseMetadata, MetadataResponse } from '../MetadataResponse'
import * as TagTools from '../TagTools'
import * as API from '../hydrus-backend'
import { SelectedResult } from './ImageWall'
import { createListOfUniqueTags, getAllTagsServiceKey, loadServiceData } from './SearchPageHelpers'

function getMostRelevantCreatorTag(tags: TagTools.Tuple[] | undefined): string {
    if (tags === undefined) { return '' }
    tags?.sort((a, b) => { return b.count - a.count })
    return tags[0].value
}
function getSuggestedDate(dates: number[]): { key: string, value: number }[] {
    function addZeroIfNecessary(month: number): string {
        if (month < 10) {
            return `0${month}`
        }
        return `${month}`
    }

    const stringDates = []
    for (let date of dates) {
        let timestamp = new Date(date)
        stringDates.push(`${timestamp.getFullYear()} ${addZeroIfNecessary(timestamp.getMonth() + 1)}`)
    }
    const dateMap = stringDates.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
    //console.log(dateMap)
    const dateArray: { key: string, value: number }[] = []
    dateMap.forEach((value, key, map) => { dateArray.push({ key: key, value: value }) })
    dateArray.sort((a, b) => { return b.value - a.value })
    console.log(dateArray)
    //console.log(stringDates)
    return dateArray
}
function titleSort(a: TagTools.Tuple, b: TagTools.Tuple): number {
    const aIsPreferred = a.namespace === 'group-title'
    const bIsPreferred = b.namespace === 'group-title'

    if (aIsPreferred && bIsPreferred) {
        //Sort normally
        return a.count - b.count;
    }
    else if (aIsPreferred && !bIsPreferred) {
        return 1;
    }
    else {
        return -1;
    }
}
function getSuggestedTitle(tags: TagTools.Tuple[] | undefined): string {
    //This regex is supposed to match '[{creatorName}] {year} {month} '
    const replacementRegex = /\[(.*?)\] [0-9]{4} [0-9]{2}/
    if (tags === undefined || tags.length === 0) { return '' }
    console.log(tags)
    tags?.sort(titleSort)
    return tags[0].value.replace(replacementRegex, '')
}
export async function getGroupName(elements: SelectedResult[]) {
    let groupName = ''

    // Check files group names
    const serviceData = loadServiceData()
    const allElements: string[][] = []
    const metadataElements: MetadataResponse[] = []
    const entriesHashes: string[] = []

    //Grab wanted Metadata

    const creatorNamespace = 'creator:'
    const titleNamespaces = ['group-title:', 'doujin-title:', 'pixiv-title:', 'kemono-title:', 'title:', 'inkbunny-title']
    const dateNamespaces = ['post-date:']
    const searchedNamespaces = [creatorNamespace, ...titleNamespaces, ...dateNamespaces]


    const allTagServiceKey = getAllTagsServiceKey()
    //const allTagServiceKey = getAllTagsServiceKey()
    for (let element of elements) {
        for (let entry of element.result.entries) {
            //metadataElements.push(entry)
            entriesHashes.push(entry.hash)

        }
    }

    let response: CacheAxiosResponse<APIResponseMetadata> | undefined = await API.api_get_file_metadata({ tag_services: ['all known tags'], only_file_tags: true, tags: searchedNamespaces, hashes: entriesHashes, abortController: undefined })
    if (response) {
        metadataElements.push(...response?.data.metadata)
    }
    console.log(metadataElements.length)
    console.log(metadataElements)


    const uniqueTags = createListOfUniqueTags(metadataElements).get(allTagServiceKey)
    console.log(uniqueTags)

    //Get creators of the files
    const creatorTags = uniqueTags?.filter((element) => { return element.namespace === 'creator' })
    const titleTags = uniqueTags?.filter((element) => { return ['group-title', 'doujin-title', 'pixiv-title', 'title', 'kemono-title'].includes(element.namespace) })
    console.log(titleTags)
    console.log(creatorTags)
    //Get date of the files
    const dates = uniqueTags?.filter((element) => { return element.namespace === 'post-date' })
    console.log(dates)
    const datesTimestamps = []
    for (let date of dates || []) {
        datesTimestamps.push(Date.parse(date.value))
    }
    for (let entry of metadataElements) {
        let usedDate = entry.time_modified
        if (usedDate < 9999999999) {
            usedDate = usedDate * 1000
        }
        datesTimestamps.push(usedDate)
        //console.log(entry.time_modified_details)
    }
    console.log(datesTimestamps)

    let proposedDates = getSuggestedDate(datesTimestamps)

    let proposedTitle = `[${getMostRelevantCreatorTag(creatorTags)}] ${proposedDates[0].key} ${getSuggestedTitle(titleTags)}`
    console.log(proposedTitle)

    let addedObject: { [key: string]: { [action: number]: string[] } } = {}
    const ImportedTagsServiceKey = serviceData?.local_tags.filter((element) => { return element.name === 'Imported Tags' })[0].service_key

    console.log(ImportedTagsServiceKey)
    if (ImportedTagsServiceKey !== undefined) {
        addedObject[ImportedTagsServiceKey] = {
            0: [`group-title:${proposedTitle}`],
            //1:[] //This should be a list of other group-titles that might not pass
        }
    }
    console.log(entriesHashes)
    console.log(addedObject)



    //let response = await API.add_tags_add_tag({hashes:entriesHashes,service_keys_to_actions_to_tags:addedObject})
    //console.log(response)

    let finalProposedTitle = `group-title:${proposedTitle}`

    console.log(`Would add tag \"${finalProposedTitle}\" to ${entriesHashes.length} files`)

    let returnedObject = {
        proposedTitle: finalProposedTitle,
        dates: proposedDates,
        creators: creatorTags,
        titles: titleTags

    }

    //Create a group name tag using this spec
    //[${dominantCreator}] ${earliestRealDate} ${groupTitle} ?/{$subgroupTitle}


    return returnedObject
}