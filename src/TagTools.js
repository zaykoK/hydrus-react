import * as TagColor from './tagColors.js'

export function getTagTextStyle(style) {
  if (style === '') { style = 'unnamedspaced' }
  const cssStyle = {
    cursor: 'pointer',
    margin: '2px 4px 4px 2px',
    width: 'fit-content',
    color: (TagColor.colors[style] != undefined ? TagColor.colors[style] : TagColor.colors['other']),
    fontSize: '1em',
    fontFamily: 'verdana, sans-serif, helvetica'
  }
  return cssStyle
}

export function getTagButtonStyle(style) {
  const cssStyleCommon = {
    borderRadius: '5px',
    border: 'none',
    height: '30px',
    fontSize: 'larger',
    background: (TagColor.colors[style] !== undefined ? TagColor.colors[style] : TagColor.colors['other']),
    color: (TagColor.buttonTextColors[style] !== undefined ? TagColor.buttonTextColors[style] : 'white')
  }

  //console.log(style)
  if (style === undefined) {return}
  if (style === '') { style = 'unnamedspaced' }
  let exclude = false
  if (style.charAt(0) === '-') {style = style.substring(1); exclude = true}
  if (exclude) {
    let gradient = 'linear-gradient(270deg,' + (TagColor.colors[style] !== undefined ? TagColor.colors[style] : TagColor.colors['other']) + ' , #020024)'
    return {
      ...cssStyleCommon,
      background: gradient,
      border: 'solid',
      borderColor: 'black'
    }
  }
  
  return cssStyleCommon
}

export function transformIntoTuple(tags) {
  let tagsSorted = []
  let tagMap = new Map()
  for (let element in tags) {
    let temp = ''
    //Little hacky way of processing OR queries [tag1,[tag2,tag3]]
    if (Array.isArray(tags[element])) {
      temp = tags[element][0].split(':');
    }
    else {
      temp = tags[element].split(':');
    }

    function getMapValue(map, key) {
      if (map.get(key) !== undefined) {
        return map.get(key).count +1
      }
      return 1
    }

    if (temp.length === 1) {
      tagsSorted.push({ namespace: '', value: temp[0], count: 1 })
      tagMap.set(tags[element], { namespace: '', value: temp[0], count: getMapValue(tagMap, tags[element]) })
    }
    if (temp.length > 1) {
      let k = temp.shift();
      let val = temp.join(':')
      tagsSorted.push({ namespace: k, value: val, count: 1 })
      tagMap.set(tags[element], { namespace: k, value: val, count: getMapValue(tagMap, tags[element]) })
    }

  }

  return tagsSorted
}

//Controls order in which tags appear on tag list
export const namespaceOrder = {
  'filename': 0.9,
  "title": 1,
  "group-title": 2,
  "doujin-title": 3,
  'pixiv-title': 3.1,
  'kemono-title': 3.2,
  'page': 3.5, //Thank god for fractions xd
  'creator': 4,
  'series': 5,
  'character': 6,
  'person': 7,
  'gender': 8,
  'species': 9,
  'studio': 10,
  'meta': 11,
  'medium': 12,
  'censoring': 12.5,
  'rating': 13,
  '': 200
}

export function compareNamespaces(a, b) {
  let orderA = (namespaceOrder[a.namespace] != undefined) ? namespaceOrder[a.namespace] : 100
  let orderB = (namespaceOrder[b.namespace] != undefined) ? namespaceOrder[b.namespace] : 100
  if (orderA < orderB) { return -1 }
  if (orderA === orderB) {
    if (a.value < b.value) { return -1 }
    if (a.value > b.value) { return 1 }
    if (a.value === b.value) { return 0 }
  }
  if (namespaceOrder[a.namespace] > namespaceOrder[b.namespace]) { return 1 }
}