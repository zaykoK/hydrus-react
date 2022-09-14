import IconGroup from '../assets/group.svg'

import './GroupButton.css'

interface GroupButtonsProps {
  clickAction: Function;
  icon: string;
  activeValue?:boolean;
}

function returnGroupButtonStyle(inactive?: boolean) {
  let style = 'topBarButton'
  if (inactive !== undefined && inactive === false) { style += ' inactive' }
  return style
}

export function GroupButton(props: GroupButtonsProps) {

  return <img
    alt='group button'
    className={returnGroupButtonStyle(props.activeValue)}
    src={props.icon || IconGroup}
    onClick={() => { props.clickAction() }} />
}

export default GroupButton;