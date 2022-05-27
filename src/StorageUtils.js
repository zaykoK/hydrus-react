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