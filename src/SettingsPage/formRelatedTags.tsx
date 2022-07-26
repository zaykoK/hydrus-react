import React, { useEffect, useState } from 'react';
import TagDisplay from '../TagDisplay';
import { getRelatedNamespaces, setRelatedNamespaces } from '../StorageUtils';

import './SettingsPage.css'

function RelatedGroupsInput() {
    const [tag, setTag] = useState('')
    const [spaces, setSpaces] = useState<Array<Array<string>>>([])

    function handleSubmit(event: React.FormEvent):void {
      event.preventDefault()
      let temp = tag.toLowerCase()
      setSpaces(addRelatedTagToSettings(temp))
      setTag('')
    }

    function removeRelatedTagFromSetting(tag: string):void {
      let spaces = getRelatedNamespaces()
      let returnSpaces: Array<Array<string>> = []
      let i = spaces.indexOf(tag);
      let afterRemove = spaces.slice();
      afterRemove.splice(i, 1);
      for (let space of afterRemove) {
        returnSpaces.push([space+':*'])
      }
      setRelatedNamespaces(afterRemove)
      setSpaces(returnSpaces)
    }

    function spacesToTags(spaces: Array<Array<string>>):Array<Array<string>>{
      let tags: Array<Array<string>> = []
      for (let space of spaces) {
        if (space[0].includes(':*')) {return spaces}
        tags.push([space[0]+':*'])
      }

      return tags
    }

    function addRelatedTagToSettings(tag: string):Array<Array<string>> {
      let spaces = getRelatedNamespaces()
      let returnSpaces: Array<Array<string>> = []
      if (spaces.includes(tag)) {
        
        for (let space of spaces) {
          returnSpaces.push([space])
        }
        return returnSpaces
      }
      spaces.push(tag)
      setRelatedNamespaces(spaces)

      for (let space of spaces) {
        returnSpaces.push([space])
      }

      return returnSpaces
    }

    useEffect(() => {
      let spaces = []
      for (let space of getRelatedNamespaces()){
        spaces.push([space+':*'])
      }
      setSpaces(spaces)
    }, [])

    return <div className="searchBarSt">
      <TagDisplay key={spaces.toString()} removeTag={removeRelatedTagFromSetting} tags={spacesToTags(spaces)} />
      <form onSubmit={handleSubmit} className="formStyle">
        <label className="labelStyle">
          <input className="inputStyle"
            type="text"
            value={tag}
            placeholder="Input tag namespaces that you want to see in related list"
            onChange={(e) => setTag(e.target.value)} />
        </label>
      </form>
    </div>
  }
export default RelatedGroupsInput;