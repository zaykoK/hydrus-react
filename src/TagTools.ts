import React from 'react'
import * as TagColor from './tagColors'

export function getTagTextStyle(style: string):React.CSSProperties {
  if (style === '') { style = 'unnamedspaced' }
  const cssStyle = {
    cursor: 'pointer',
    padding: '2px 4px 4px 2px',
    margin: '2px',
    width: 'fit-content',
    color: (TagColor.colors[style] != undefined ? TagColor.colors[style] : TagColor.colors['other']),
    fontSize: '1em',
    fontFamily: 'verdana, sans-serif, helvetica'
  }
  return cssStyle
}

export function getTagButtonStyle(style: string):React.CSSProperties {
  if (style === '') { style = 'unnamedspaced' }
  const cssStyleCommon = {
    borderRadius: '5px',
    border: 'none',
    height: 'inherit',
    fontSize: '12px',
    flexGrow: '1',
    background: (TagColor.colors[style] !== undefined ? TagColor.colors[style] : TagColor.colors['other']),
    color: (TagColor.buttonTextColors[style] !== undefined ? TagColor.buttonTextColors[style] : 'white')
  }
  if (style === undefined) { return cssStyleCommon }

  let exclude = false
  if (style.charAt(0) === '-') {
    style = style.substring(1); exclude = true
  }
  if (exclude) {
    let gradient = 'linear-gradient(270deg,' + (TagColor.colors[style] !== undefined ? TagColor.colors[style] : TagColor.colors['other']) + ' , #020024)'
    return {
      ...cssStyleCommon,
      background: TagColor.colors[style] !== undefined ? TagColor.colors[style] : TagColor.colors['other'],
      boxShadow: '0px 0px 7px 0px black',
      //border: 'solid',
      //borderColor: 'black'
    }
  }

  return cssStyleCommon
}


export function tagArrayToNestedArray(tagArray: Array<string>): Array<Array<string>> {
  let nestedArray: Array<Array<string>> = []

  for (let element of tagArray) {
    nestedArray.push([element])
  }

  return nestedArray
}


//Transforms tag array into a map with count of those tags
export function tagArrayToMap(tags: Array<string>) {
  return tags.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map()); //I have no clue what this actually does, need to check it
}

export type Tuple = {
  namespace: string;
  value: string;
  count: number;
}

export function transformIntoTuple(tags: Map<string, number>): Array<Tuple> {
  let tagsSorted = []

  if (tags == undefined) { return [{ namespace: '', value: '', count: 0 }] }

  for (const [key, value] of tags.entries()) {
    let temp = []
    //Little hacky way of processing OR queries [tag1,[tag2,tag3]]
    if (Array.isArray(key)) {
      temp = key[0].split(':');
    }
    else {
      if (typeof key == 'string')
        temp = key.split(':');
    }

    if (temp.length === 1) {
      tagsSorted.push({ namespace: '', value: temp[0], count: value })
    }
    if (temp.length > 1) {
      let namespace: string = temp.shift();
      let val: string = temp.join(':')
      tagsSorted.push({ namespace: namespace, value: val, count: value })
    }

  }
  return tagsSorted
}

//Controls order in which tags appear on tag list

type NamespaceOrder = {
  [namespace:string]: number;
}

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
} as NamespaceOrder

export function compareNamespaces(a:Tuple, b:Tuple) {
  //This assigns a number for object a and b, based on lookup table above
  let orderA = (namespaceOrder[a.namespace] != undefined) ? namespaceOrder[a.namespace] : 100
  let orderB = (namespaceOrder[b.namespace] != undefined) ? namespaceOrder[b.namespace] : 100

  if (orderA < orderB) { return -1 }
  if (orderA === orderB) {
    if (a.value < b.value) { return -1 }
    if (a.value > b.value) { return 1 }
    if (a.value === b.value) { return 0 }
  }
  return 1
}