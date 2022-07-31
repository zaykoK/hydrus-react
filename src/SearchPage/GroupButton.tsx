import { getGroupingToggle } from '../StorageUtils';
import IconGroup from '../assets/group.svg'

import './GroupButton.css'

interface GroupButtonsProps {
  clickAction: Function;
  icon: string;
}

export function GroupButton(props: GroupButtonsProps) {

  function returnGroupButtonStyle(enabled: boolean) {
    if (enabled) { return 'topBarButton' }
    return 'topBarButton groupActive'
  }

  return <img
    className={returnGroupButtonStyle(getGroupingToggle())}
    src={props.icon || IconGroup}
    onClick={() => { props.clickAction() }} />
}

export default GroupButton;