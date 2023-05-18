
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

export function setSortType(sortType: number) {
  localStorage.setItem('sortType', sortType.toString())
}

export function getSortType(): number {
  let returned = localStorage.getItem('sortType') || '2';
  return parseInt(returned)
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

export function getTranscodeFileDomain(): string {
  let optionsString = localStorage.getItem('transcoded-file-options')
  if (optionsString) {
    let options = JSON.parse(optionsString)
    return options.fileServiceName
  }
  return 'web-transcodes'
}

export function getTranscodeFileNamespace(): string {
  let optionsString = localStorage.getItem('transcoded-file-options')
  if (optionsString) {
    let options = JSON.parse(optionsString)
    return options.namespace
  }
  return 'original'
}

export function setTranscodeFileDomain(domain: string) {
  let optionsString = localStorage.getItem('transcoded-file-options')
  if (optionsString) {
    let options = JSON.parse(optionsString)
    localStorage.setItem('transcoded-file-options', JSON.stringify({ fileServiceName: domain, namespace: options.namespace }))
  }
  localStorage.setItem('transcoded-file-options', JSON.stringify({ fileServiceName: domain, namespace: 'original' }))
}

export function setTranscodeFileNamespace(space: string) {
  let optionsString = localStorage.getItem('transcoded-file-options')
  if (optionsString) {
    let options = JSON.parse(optionsString)
    localStorage.setItem('transcoded-file-options', JSON.stringify({ fileServiceName: options.fileServiceName, namespace: space }))
  }
  localStorage.setItem('transcoded-file-options', JSON.stringify({ fileServiceName: 'web-transcodes', namespace: space }))
}

export function setTranscodeEnabled(value:boolean) {
  localStorage.setItem('transcoded-enabled',JSON.stringify(value))
}

export function getTranscodeEnabled():boolean {
  let currentOption:boolean = JSON.parse(localStorage.getItem('transcoded-enabled') || 'true')
  return currentOption
}

export function setExperimentalHydrusAPI(value:boolean) {
  localStorage.setItem('hydrus-extended-api',JSON.stringify(value))
}
export function getExperimentalHydrusAPI():boolean {
  let currentOption:boolean = JSON.parse(localStorage.getItem('hydrus-extended-api') || 'false')
  return currentOption
}


export function exportSettings() {
  // Server address
  // Server Key
  // Max results
  // Comic Namespace
  // Group Namespaces
  // Hidden Namespaces
  // Transcode Settings
  /// -Enabled
  /// -File Service
  /// -Namespace

  const defaultTranscodeSettings = {fileServiceName: "web-transcodes", namespace: "original"}

  let settings = {
    'hydrus-server-address': (localStorage.getItem('hydrus-server-address') || ''),
    'hydrus-api-key': (localStorage.getItem('hydrus-api-key') || ''),
    'hydrus-max-results': (localStorage.getItem('hydrus-max-results') || "5000"),
    'group-namespace': (localStorage.getItem('group-namespace') || 'group-title'),
    'comic-namespace': (localStorage.getItem('comic-namespace') || 'doujin-title'),
    'related-namespaces': (localStorage.getItem('related-namespaces') || '[]' ),
    'blacklisted-namespaces': (localStorage.getItem('blacklisted-namespaces') || '[]'),
    'transcoded-enabled': (localStorage.getItem('transcoded-enabled') || 'false'),
    'transcoded-file-options': (localStorage.getItem('transcoded-file-options'), JSON.stringify(defaultTranscodeSettings))
  }

  let stringified = JSON.stringify(settings)

  let objectURL = URL.createObjectURL(new Blob([stringified], { type: 'text/json' }))

  return objectURL
}

