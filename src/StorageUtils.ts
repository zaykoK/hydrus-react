export function getGroupingToggle():boolean {
  if (localStorage.getItem('group-toggle') === null) {
    return false
  }
  //because of string conversion, check on string is done first
  if (localStorage.getItem('group-toggle') === 'true') { return true }
  return false
}
export function getRelatedVisibile():boolean {
  if (localStorage.getItem('related-visible') === null) {
    return false
  }
  //because of string conversion, check on string is done first
  if (localStorage.getItem('related-visible') === 'true') { return true }
  return false
}

export function getComicNamespace():string {
    return localStorage.getItem('comic-namespace') || 'doujin-title'
}

export function getGroupNamespace(): string {
  return localStorage.getItem('group-namespace') || 'group-title'
}

export function getRelatedNamespaces():Array<string> {
  if (localStorage.getItem('related-namespaces') === null ) {
    return []
  }
  return JSON.parse(localStorage.getItem('related-namespaces') || '')
}
/** Stores presented array of strings into localStorage
 */
export function setRelatedNamespaces(spaces:Array<string>):void {
  localStorage.setItem('related-namespaces',JSON.stringify(spaces))
}

export function getBlacklistedNamespaces():Array<string> {
  if (localStorage.getItem('blacklisted-namespaces') === null ) {
    return []
  }
  return JSON.parse(localStorage.getItem('blacklisted-namespaces') || '')
}

export function setBlacklistedNamespaces(spaces:Array<string>):void {
  localStorage.setItem('blacklisted-namespaces',JSON.stringify(spaces))
}


