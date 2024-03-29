import React, { useEffect, useState } from 'react';
import TagDisplay from '../TagDisplay';
import { getBlacklistedNamespaces, setBlacklistedNamespaces } from '../StorageUtils';

import './SettingsPage.css'

function BlacklistedTagsInput() {
    const [tag, setTag] = useState('')
    const [spaces, setSpaces] = useState<Array<Array<string>>>([])

    function handleSubmit(event: React.FormEvent) {
      event.preventDefault()
      let temp = tag.toLowerCase()
      setSpaces(addBlacklistedSpaceToSettings(temp))
      setTag('')
    }

    function removeBlacklistedSpaceFromSettings(tag: string):void {
      let spaces = getBlacklistedNamespaces()
      let returnSpaces: Array<Array<string>> = []
      let i = spaces.indexOf(tag);
      let afterRemove = spaces.slice();
      afterRemove.splice(i, 1);
      for (let space of afterRemove) {
        returnSpaces.push([space+':*'])
      }
      setBlacklistedNamespaces(afterRemove)
      setSpaces([afterRemove])
    }

    function spacesToTags(spaces: Array<Array<string>>):Array<Array<string>>{
      let tags: Array<Array<string>> = []
      for (let space of spaces) {
        if (space[0].includes(':*')) {return spaces}
        tags.push([space[0]+':*'])
      }

      return tags
    }

    function addBlacklistedSpaceToSettings(tag: string):Array<Array<string>> {
      let spaces = getBlacklistedNamespaces()
      let returnSpaces: Array<Array<string>> = []
      if (spaces.includes(tag)) {
        
        for (let space of spaces) {
          returnSpaces.push([space])
        }
        return returnSpaces
      }
      spaces.push(tag)
      setBlacklistedNamespaces(spaces)

      for (let space of spaces) {
        returnSpaces.push([space])
      }

      return returnSpaces
    }


    useEffect(() => {
      let spaces = []
      for (let space of getBlacklistedNamespaces()){
        spaces.push([space+':*'])
      }
      setSpaces(spaces)
    }, [])

    return <div className="searchBarSt">
      <TagDisplay key={spaces.toString()} removeTag={removeBlacklistedSpaceFromSettings} tags={spacesToTags(spaces)} type='' />
      <form onSubmit={handleSubmit} className="formStyle">
        <label className="labelStyle">
          <input className="inputStyle"
            type="text"
            value={tag}
            placeholder="Input tag namespaces that you want to omit from displaying in browser tag list"
            onChange={(e) => setTag(e.target.value)} />
        </label>
      </form>
    </div>
  }
export default BlacklistedTagsInput;