import { useState } from 'react';
import * as API from '../hydrus-backend';
import * as TagTools from '../TagTools'

import './SettingsPage.css'

function ApiTestButton() {
    const [message, setMessage] = useState<{ basic_permissions: Array<number>, human_description: String }>({ basic_permissions: [], human_description: '' })

    async function buttonClick() {
        let response = await API.api_verify_access_key()
        //console.log(response.data)
        //console.log(response.data.human_description)
        setMessage(response.data)
    }

    function returnPermissionArray() {
        const elementArray = []
        for (let element of message.basic_permissions) {
            let label = ''
            switch (element) {
                case 0: label = 'Import and Edit URLs';break;
                case 1: label = 'Import and Delete Files';break;
                case 2: label = 'Edit File Tags';break;
                case 3: label = 'Search for and Fetch Files';break;
                case 4: label = 'Manage Pages';break;
                case 5: label = 'Manage Cookies';break;
                case 6: label = 'Manage Database';break;
                case 7: label = 'Edit File Notes';break;
                case 8: label = 'Manage File Relationships';break;
            }

            elementArray.push(<div key={label} className='permissionBlob'>{label}</div>)
        }
        return <div className='permissionWrapper'>{elementArray}</div>
    }


    return <div>
        <button
            className='transcodeEnabledButton tagEntry blob'
            style={TagTools.getTagButtonStyle('')}
            key='test api button'
            onClick={() => { buttonClick() }} >Test Api Connection</button>
        {(message.human_description !== '') ? returnPermissionArray() : null}
    </div>
}
export default ApiTestButton;