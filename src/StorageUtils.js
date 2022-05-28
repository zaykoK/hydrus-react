export function getGroupingToggle() {
  if (localStorage.getItem('group-toggle') === null) {
    return false
  }
  //because of string conversion, check on string is done first
  if (localStorage.getItem('group-toggle') === 'true') { return true }
  return false
}
export function getRelatedVisibile() {
  if (localStorage.getItem('related-visible') === null) {
    return false
  }
  //because of string conversion, check on string is done first
  if (localStorage.getItem('related-visible') === 'true') { return true }
  return false
}

export function getRelatedNamespaces() {
  if (localStorage.getItem('related-namespaces') === null ) {
    return []
  }
  return JSON.parse(localStorage.getItem('related-namespaces'))
}

export function setRelatedNamespaces(spaces) {
  localStorage.setItem('related-namespaces',JSON.stringify(spaces))
}

export function getBlacklistedNamespaces() {
  if (localStorage.getItem('blacklisted-namespaces') === null ) {
    return []
  }
  return JSON.parse(localStorage.getItem('blacklisted-namespaces'))
}

export function setBlacklistedNamespaces(spaces) {
  localStorage.setItem('blacklisted-namespaces',JSON.stringify(spaces))
}


