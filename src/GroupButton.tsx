import { getGroupingToggle } from './StorageUtils';
// @ts-ignore
import IconGroup from './assets/group.svg'

import './GroupButton.css'

interface GroupButtonsProps {
  clickAction: Function;
}

export function GroupButton(props: GroupButtonsProps) {

  function returnGroupButtonStyle(enabled: boolean) {
    if (enabled) { return 'groupButton' }
    return 'groupButton groupActive'
  }

  return <img
    className={returnGroupButtonStyle(getGroupingToggle())}
    src={IconGroup}
    onClick={() => { props.clickAction() }} />
}

export default GroupButton;