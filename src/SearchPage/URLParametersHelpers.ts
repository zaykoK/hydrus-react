import { tagArrayToNestedArray } from '../TagTools';

function setDefaultSearch(): Array<Array<string>> {
    return []
    //@ts-ignore
    switch (props.type) {
        case 'image':
            return [[]]
        case 'comic':
            return [[]]
        // Removed because I added it in search function, should be better user experience without those 2 queries visible
        //return [[getComicNamespace() + ':*'], ['page:0', 'page:1']]
        default:
            return [[]]
    }
}


export function readParams(par: string | undefined): { tags: Array<Array<string>>, page: string, hash: string, type:string } {
    if (par === undefined) {console.log('parm undefined'); return { tags: [[]], page: '1', hash: '',type:'image' } }
    let parameters = new URLSearchParams(par);
    let tags = setDefaultSearch()

    if (parameters.getAll('tags').length != 0) {
        tags = tagArrayToNestedArray(parameters.getAll('tags'))

        //Bring back invalid URL characters
        for (let tagArray in tags) {
            for (let tag in tags[tagArray]) {
                tags[tagArray][tag] = tags[tagArray][tag].replace('!ANDS', '&').replace('!PLUSSYMBOL', '+')
            }
        }

        //Returns all non empty results, since params sometimes have 'tags=' element
        tags = tags.filter(function (x) { return x[0] !== '' })
        let sortedTags: Array<Array<string>> = []
        for (let tagArray of tags) {
            //If parameter is an OR search
            let s = tagArray[0].split(' OR ') //Always going to be single element array anyway
            if (s.length === 0) { //If Tag is not an OR search
                sortedTags.push([s[0]]) //Wrap in Array for consistency sake so the element ends up as ['tag']
            }
            else {
                sortedTags.push(s) //Just add the given array, this essentialy turns "tag1 OR tag2" into ['tag1,'tag2']
            }
        }
        tags = sortedTags
    }
    let page = '1'
    let hash = ''
    let type = 'image'
    if (parameters.get('page') !== undefined) { page = parameters.get('page') || '1' } //This last OR is to make the checking not whine, it shouldn't ever need to use it
    if (parameters.get('hash') !== undefined) { hash = parameters.get('hash') || '' }
    if (parameters.get('type') !== undefined) { type = parameters.get('type') || 'image'}

    return { tags: tags, page: page, hash: hash, type: type }
}