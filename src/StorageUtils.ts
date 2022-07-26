
export function getGroupingToggle(): boolean {
  if (localStorage.getItem('group-toggle') === null) {
    return false
  }
  //because of string conversion, check on string is done first
  if (localStorage.getItem('group-toggle') === 'true') { return true }
  return false
}

export function getRelatedVisibile(): boolean {
  if (localStorage.getItem('related-visible') === null) {
    return false
  }
  //because of string conversion, check on string is done first
  if (localStorage.getItem('related-visible') === 'true') { return true }
  return false
}

export function getComicNamespace(): string {
  return localStorage.getItem('comic-namespace') || 'doujin-title'
}

export function getMobileStyle(): string {
  return localStorage.getItem('mobile-mode') || 'false'
}

export function setMobileStyle(enabled: boolean): void {
  if (enabled) { localStorage.setItem('mobile-mode', 'true'); return }
  localStorage.setItem('mobile-mode', 'false')
}

export function setComicNamespace(namespace: string) {
  if (namespace === '') {
    localStorage.removeItem('comic-namespace')
    return
  }
  localStorage.setItem('comic-namespace', namespace)
}

export function getGroupNamespace(): string {
  return localStorage.getItem('group-namespace') || 'group-title'
}

export function setGroupNamespace(namespace: string) {
  if (namespace === '') {
    localStorage.removeItem('group-namespace')
    return
  }
  localStorage.setItem('group-namespace', namespace)
}

export function getMaxResults(): string {
  return localStorage.getItem('hydrus-max-results') || "5000";
}

export function setMaxResults(count: string) {
  localStorage.setItem('hydrus-max-results', count)
}

export function getRelatedNamespaces(): Array<string> {
  if (localStorage.getItem('related-namespaces') === null) {
    return []
  }
  return JSON.parse(localStorage.getItem('related-namespaces') || '')
}
/** Stores presented array of strings into localStorage
 */
export function setRelatedNamespaces(spaces: Array<string>): void {
  localStorage.setItem('related-namespaces', JSON.stringify(spaces))
}

export function getBlacklistedNamespaces(): Array<string> {
  if (localStorage.getItem('blacklisted-namespaces') === null) {
    return []
  }
  return JSON.parse(localStorage.getItem('blacklisted-namespaces') || '')
}

export function setBlacklistedNamespaces(spaces: Array<string>): void {
  localStorage.setItem('blacklisted-namespaces', JSON.stringify(spaces))
}

export function getServerAddress(): string {
  return localStorage.getItem('hydrus-server-address') || '';
}

export function setServerAddress(address: string) {
  localStorage.setItem('hydrus-server-address', address)
}

export function getAPIKey(): string {
  return localStorage.getItem('hydrus-api-key') || '';
}

export function setAPIKey(key: string) {
  localStorage.setItem('hydrus-api-key', key)
}

export function exportSettings() {

  //Server address
  //Server Key
  //Max results
  //Group Namespaces
  //Hidden Namespaces
  //Comic Namespace
  //Mobile Style

  let settings = {
    'hydrus-server-address': (localStorage.getItem('hydrus-server-address') || ''),
    'hydrus-api-key': (localStorage.getItem('hydrus-api-key') || ''),
    'hydrus-max-results': (localStorage.getItem('hydrus-max-results') || "5000"),
    'group-namespace': (localStorage.getItem('group-namespace') || 'group-title'),
    'blacklisted-namespaces': (localStorage.getItem('blacklisted-namespaces') || ''),
    'comic-namespace': (localStorage.getItem('comic-namespace') || 'doujin-title'),
    'mobile-mode': (localStorage.getItem('mobile-mode') || 'false')
  }

  let stringified = JSON.stringify(settings)

  let objectURL = URL.createObjectURL(new Blob([stringified], { type: 'text/json' }))

  return objectURL

}

