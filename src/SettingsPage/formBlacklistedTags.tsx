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

      let i = spaces.indexOf(tag);
      let afterRemove = spaces.slice();
      afterRemove.splice(i, 1);


      
      setBlacklistedNamespaces(afterRemove)
      setSpaces([afterRemove])
    }

    function addBlacklistedSpaceToSettings(tag: string):Array<Array<string>> {
      let spaces = getBlacklistedNamespaces()
      if (spaces.includes(tag)) { return [spaces] }
      spaces.push(tag)
      setBlacklistedNamespaces(spaces)
      return [spaces]
    }

    useEffect(() => {
      let spaces = []
      for (let space of getBlacklistedNamespaces()){
        spaces.push([space+':*'])
      }
      setSpaces(spaces)
    }, [])

    return <div className="searchBarSt">
      <TagDisplay key={spaces.toString()} removeTag={removeBlacklistedSpaceFromSettings} tags={spaces} />
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