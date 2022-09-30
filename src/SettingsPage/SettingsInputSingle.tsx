import React, { useState } from 'react';
import { isMobile } from '../styleUtils';
import './SettingsPage.css'

interface SettingSingleInterface {
    initialValue: Function; //Function that gets initial value of setting, should be one of getter from StorageUtils
    label: string; //What to display as input label
    setFunction: Function; //Function to call when submiting
    type:string;
    disabled?:boolean;
}

function getSettingsInputStyle() {
    let style = 'settingsBar'
    if (isMobile()) {style += ' mobile'}
    return style
}

function SettingInputSingle(args: SettingSingleInterface) {
    const [settingValue, setSettingValue] = useState(args.initialValue());

    function submitKey(event: React.FormEvent) {
        event.preventDefault();
        if (settingValue) { args.setFunction(settingValue) }
    }

    function KeyInput() {
        return <form onSubmit={submitKey}>
            <label>
                {args.label}
                <input
                    disabled={args.disabled || false}
                    className={getSettingsInputStyle()}
                    type={args.type}
                    value={settingValue}
                    onChange={(e) => setSettingValue(e.target.value)} />
            </label>
        </form>;
    }
    return <div>{KeyInput()}</div>
}
export default SettingInputSingle;