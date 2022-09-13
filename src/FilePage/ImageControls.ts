/* Moved from FilePage because that way it doesn't unnecessarily recreate those functions every re-render */

import { NavigateFunction } from "react-router-dom"

function returnFileLink(hash: string): string {
    return "/file/" + hash
}

/* Wrapper for sessionStorage.getItem(). Always returns string value, handles null on it's own.*/
function getSessionStorage(key:string,defaultValue='[]'):string {
    let value:string|null
    value = sessionStorage.getItem(key)
    if (value === null) {value = defaultValue}
    return value
}


//"This is ... too much" - George L.
//TODO find some way to simplify this whole next/prev image

export function PreviousImage(fileHash: string | undefined, navigate: NavigateFunction): void {
    if (fileHash === undefined) { return }
    if (sessionStorage.getItem('group-hashes') === null) { return PreviousSearchImage(fileHash, navigate) }
    let searchList: Array<string> = JSON.parse(getSessionStorage('hashes-search'))
    let elementList: Array<string> = JSON.parse(getSessionStorage('group-hashes'))
    let index = elementList.indexOf(fileHash || '')
    //Move to next
    if (index - 1 < 0) { return PreviousSearchImage(fileHash, navigate) }
    if (searchList.indexOf(elementList[index - 1]) === -1) {
        if (searchList.indexOf(fileHash || '') !== -1) {
            sessionStorage.setItem('hashes-search-last-valid', JSON.stringify(fileHash))
        }
    }
    navigate(returnFileLink(elementList[index - 1]), { replace: true })
}

export function GoToFirstImage(navigate: NavigateFunction):void {
    //If no data about image groups don't do anything
    if (sessionStorage.getItem('group-hashes') === null) { return }
    let imageGroupHashes: Array<string> = JSON.parse(getSessionStorage('group-hashes'))
    navigate(returnFileLink(imageGroupHashes[0]), { replace: true })   

}

export function GoToLastImage(navigate: NavigateFunction):void {
    //If no data about image groups don't do anything
    if (sessionStorage.getItem('group-hashes') === null) { return }
    let imageGroupHashes: Array<string> = JSON.parse(getSessionStorage('group-hashes'))
    //console.log(imageGroupHashes.length)
    navigate(returnFileLink(imageGroupHashes[imageGroupHashes.length -1]), { replace: true })   
}



export function NextImage(fileHash: string | undefined, navigate: NavigateFunction): void {
    //If somehow fileHash is empty, don't do anything
    if (fileHash === undefined) { return }
    //If there is no image group, go to next search result
    if (sessionStorage.getItem('group-hashes') === null) { return NextSearchImage(fileHash, navigate) }
    //Load both lists from sessionStorage
    let searchResultsHashes: Array<string> = JSON.parse(getSessionStorage('hashes-search'))
    let imageGroupHashes: Array<string> = JSON.parse(getSessionStorage('group-hashes'))
    //Find index of current image in the list
    let index = imageGroupHashes.indexOf(fileHash || '')
    //Move to next search result if moving forward would exceed group size
    if (index + 1 >= imageGroupHashes.length) { return NextSearchImage(fileHash, navigate) }
    //TODO What is this doing?

    //Remember hash of imageGroup entry that also exists in searchResults
    /* Basically when moving to hashes outside searchResult scope remember last entry that exists within it so whenever NextSearchResult is called we know frome where to start counting again */
    if (searchResultsHashes.indexOf(imageGroupHashes[index + 1]) === -1) { //This check shouldn't really ever give anything but true given how searchResults are done
        if (searchResultsHashes.indexOf(fileHash) !== -1) {
            sessionStorage.setItem('hashes-search-last-valid', JSON.stringify(fileHash))
        }
    }
    //Go to next image
    navigate(returnFileLink(imageGroupHashes[index + 1]), { replace: true })
}

export function PreviousSearchImage(fileHash: string | undefined, navigate: NavigateFunction, useLast:boolean = false): void {
    //If somehow fileHash is empty, don't do anything
    if (fileHash === undefined) { return }
    //If there is no searchHashes in session storage, don't do anything
    if (sessionStorage.getItem('hashes-search') === null) { return }
     //Load searchHashes list from sessionStorage
    let searchResultHashes: Array<string> = JSON.parse(getSessionStorage('hashes-search'))
    //Find index of current image in the list
    let index = searchResultHashes.indexOf(fileHash)
    //If image doesn't exist in list, try to load last valid, if that fails don't do anything
    if (index === -1) {
        if (sessionStorage.getItem('hashes-search-last-valid') !== null) {
            index = searchResultHashes.indexOf(JSON.parse(sessionStorage.getItem('hashes-search-last-valid') || ''))
        }
        else {
            return
        }
    }
    //If first/last file in set don't do anything
    if (index - 1 < 0) { return }
    //If currently tracking group related files delete them
    if (sessionStorage.getItem('group-hashes') !== null) {
        let groupHashes: Array<string> = JSON.parse(getSessionStorage('group-hashes'))
        if (groupHashes.indexOf(searchResultHashes[index - 1]) === -1) { sessionStorage.removeItem('group-hashes') }
    }

    // if useLast go to last entry in it's group
    if (useLast) {
        //TODO add code that will allow to move to last image in previous image imageGroup
    }

    navigate(returnFileLink(searchResultHashes[index - 1]), { replace: true })
}

export function NextSearchImage(fileHash: string | undefined, navigate: NavigateFunction): void {
    if (fileHash === undefined) { return }
    if (sessionStorage.getItem('hashes-search') === null) { return }
    let elementList: Array<string> = JSON.parse(getSessionStorage('hashes-search'))
    let index = elementList.indexOf(fileHash)
    if (index === -1) {
        if (sessionStorage.getItem('hashes-search-last-valid') !== null) {
            index = elementList.indexOf(JSON.parse(sessionStorage.getItem('hashes-search-last-valid') || ''))
        }
        else {
            return
        }
    }
    //If first/last file in set don't do anything
    if (index + 1 >= elementList.length) { return }
    //If currently tracking group related files delete them
    if (sessionStorage.getItem('group-hashes') !== null) {
        let groupHashes: Array<string> = JSON.parse(getSessionStorage('group-hashes'))
        if (groupHashes.indexOf(elementList[index + 1]) === -1) { sessionStorage.removeItem('group-hashes') }
    }

    navigate(returnFileLink(elementList[index + 1]), { replace: true })
}