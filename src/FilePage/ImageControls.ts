/* Moved from FilePage because that way it doesn't unnecessarily recreate those functions every re-render */

import { NavigateFunction, useNavigate } from "react-router-dom"

function returnFileLink(hash: string): string {
    return "/file/" + hash
}


//"This is ... too much" - George L.
//TODO find some way to simplify this whole next/prev image

export function PreviousImage(fileHash: string | undefined, navigate: NavigateFunction): void {

    if (fileHash === undefined) { return }
    if (sessionStorage.getItem('group-hashes') === null) { return PreviousSearchImage(fileHash, navigate) }
    let searchList: Array<string> = JSON.parse(sessionStorage.getItem('hashes-search') || '')
    let elementList: Array<string> = JSON.parse(sessionStorage.getItem('group-hashes') || '')
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

export function NextImage(fileHash: string | undefined, navigate: NavigateFunction): void {
    if (fileHash === undefined) { return }
    if (sessionStorage.getItem('group-hashes') === null) { return NextSearchImage(fileHash, navigate) }
    let searchList: Array<string> = JSON.parse(sessionStorage.getItem('hashes-search') || '')
    let elementList: Array<string> = JSON.parse(sessionStorage.getItem('group-hashes') || '')
    let index = elementList.indexOf(fileHash || '')
    //Move to next
    if (index + 1 >= elementList.length) { return NextSearchImage(fileHash, navigate) }
    if (searchList.indexOf(elementList[index + 1]) === -1) {
        if (searchList.indexOf(fileHash || '') !== -1) {
            sessionStorage.setItem('hashes-search-last-valid', JSON.stringify(fileHash))
        }
    }
    navigate(returnFileLink(elementList[index + 1]), { replace: true })
}

export function PreviousSearchImage(fileHash: string | undefined, navigate: NavigateFunction): void {
    if (fileHash === undefined) { return }
    if (sessionStorage.getItem('hashes-search') === null) { return }
    let elementList: Array<string> = JSON.parse(sessionStorage.getItem('hashes-search') || '')
    let index = elementList.indexOf(fileHash || '')
    if (index === -1) {
        if (sessionStorage.getItem('hashes-search-last-valid') !== null) {
            index = elementList.indexOf(JSON.parse(sessionStorage.getItem('hashes-search-last-valid') || ''))
        }
        else {
            return
        }
    }
    //If first/last file in set don't do anything
    if (index - 1 < 0) { return }
    //If currently tracking group related files delete them
    if (sessionStorage.getItem('group-hashes') !== null) {
        let groupHashes: Array<string> = JSON.parse(sessionStorage.getItem('group-hashes') || '')
        if (groupHashes.indexOf(elementList[index - 1]) === -1) { sessionStorage.removeItem('group-hashes') }
    }
    navigate(returnFileLink(elementList[index - 1]), { replace: true })
}

export function NextSearchImage(fileHash: string | undefined, navigate: NavigateFunction): void {
    if (fileHash === undefined) { return }
    if (sessionStorage.getItem('hashes-search') === null) { return }
    let elementList: Array<string> = JSON.parse(sessionStorage.getItem('hashes-search') || '')
    let index = elementList.indexOf(fileHash || '')
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
        let groupHashes: Array<string> = JSON.parse(sessionStorage.getItem('group-hashes') || '')
        if (groupHashes.indexOf(elementList[index + 1]) === -1) { sessionStorage.removeItem('group-hashes') }
    }

    navigate(returnFileLink(elementList[index + 1]), { replace: true })
}