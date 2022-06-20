//To add new tag color add 'namespace': 'css accepted color format'

type ColorsList = {
  [namespace:string]:string;
}

export const colors = {
  "series": '#aa00aa',
  "character": '#00aa00',
  "person": '#008000',
  "creator": '#aa0000',
  'rating': '#fafafa',
  'medium' : '#707223',
  'page': '#2674ac',
  'chapter': '#4c2e34',
  'volume': '#b9b435',
  'title': '#2c29bc',
  'group-title' : '#4bfb78',
  'doujin-title': '#8a2e77',
  'pixiv-title': '#7ae017',
  'system': '#996515',
  'species': '#0b5504',
  'studio': '#800000',
  'gender': '#345e5f',
  'meta': '#4b4b4b',
  'other': '#72a0c1',
  'unnamedspaced': '#006ffa',
  'censoring': '#3f3f3f'
} as ColorsList

export const buttonTextColors = {
  'rating' : '#252526',
} as ColorsList