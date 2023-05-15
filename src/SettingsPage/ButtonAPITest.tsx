import { useState } from 'react';
import * as API from '../hydrus-backend';
import * as TagTools from '../TagTools'

import './SettingsPage.css'

function ApiTestButton() {
    const [message, setMessage] = useState<{ basic_permissions: Array<number>, human_description: String }>({ basic_permissions: [], human_description: '' })

    async function buttonClick() {
        let response = await API.api_verify_access_key()
        setMessage(response.data)
    }

    function returnPermissionArray() {
        const elementArray = []
        const fullSet = [0,1,2,3,4,5,6,7,8]
        for (let element of fullSet) {
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

            if (message.basic_permissions.includes(element)) {
                elementArray.push(<div key={label} className='permissionBlob'>{label}</div>)
            }
            else {
                elementArray.push(<div key={label} className='permissionBlob denied'>{label}</div>)
            }
            
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