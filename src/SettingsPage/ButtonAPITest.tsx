import { useState } from 'react';
import * as API from '../hydrus-backend';
import * as TagTools from '../TagTools'

import './SettingsPage.css'

function ApiTestButton() {
    const [message, setMessage] = useState('')

    async function buttonClick() {
        let response = await API.api_verify_access_key()
        console.log(response.data.human_description)
        setMessage(response.data.human_description)
    }

    return <div><button className='transcodeEnabledButton tagEntry blob' style={TagTools.getTagButtonStyle('')} key='test api button' onClick={() => { buttonClick() }} >Test Api Connection</button>{message}</div>
}
export default ApiTestButton;