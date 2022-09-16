import { NavigateFunction } from "react-router-dom"

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

// function changePage(newPage: number,navigate:NavigateFunction,type:string) {
//     let par = generateSearchURL(tags, newPage, params.hash)

//     navigateTo(par, navigate, type)

//     sessionStorage.removeItem('searchScroll')
//     window.scrollTo(0, 0)
//   }


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


export function addTag(tag: Array<string> | string, navigate: NavigateFunction, type: string): void {
    let tags: Array<Array<string>> = JSON.parse(sessionStorage.getItem('current-search-tags') || '[]')

    let currentHash = sessionStorage.getItem('currently-displayed-hash') || ''

    //If it so happens that tag is string put it into array
    if (typeof tag === 'string') {
        tag = [tag]
    }

    if (tags) {
        //If it's only a single empty string
        if (tag[0] === '') { return }
        let newTags = tags.slice(); //This gives me copy of tags array instead of pointing to array, needed for update process

        for (let entry of newTags) {
            if (JSON.stringify(entry) === JSON.stringify(tag)) { console.log('found tag already exists'); return }
        }

        //TODO process certain unique tags that user shouldn't be able to add
        newTags.push(tag);

        let par = generateSearchURL(newTags, 1, currentHash, type)
        navigateTo(par, navigate, type)
    }
}

export function removeTag(tag: Array<string>, navigate: NavigateFunction, type: string) {
    let tags = JSON.parse(sessionStorage.getItem('current-search-tags') || '[]')

    let currentHash = sessionStorage.getItem('currently-displayed-hash') || ''

    if (tags) {
        let i = 0;
        let stringified = JSON.stringify(tag)
        for (let entry in tags) {
            if (JSON.stringify(tags[entry]) === stringified) {
                //console.log('found the tag ' + stringified + ' its on position' + entry)
                i = parseInt(entry)
                break
            }
        }

        if (i === -1) {
            console.warn("Didn't find tag " + tag + ' inside ' + tags)
            return
        }
        let afterRemove = tags?.slice();
        afterRemove.splice(i, 1);

        let par = generateSearchURL(afterRemove, 1, currentHash, type)
        navigateTo(par, navigate, type)
    }
}