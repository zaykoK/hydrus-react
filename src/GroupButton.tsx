import { getGroupingToggle } from './StorageUtils';
// @ts-ignore
import IconGroup from './assets/group.svg'
import colors from './stylingVariables';

interface GroupButtonsProps {
  clickAction:Function;
}

export function GroupButton(props:GroupButtonsProps) {

    function returnGroupButtonStyle(enabled:boolean) {
      if (enabled) { return ButtonStyle }
      return { ...ButtonStyle, opacity: '0.3' }
    }

    const ButtonStyle = {
      height: '1.5em',
      width: '1.5em',
      background: colors.COLOR2,
      margin: '2px',
      padding: '5px',
      borderRadius: '10px',
      cursor: 'pointer',
      opacity: '0.7'
    }

    return <img
      src={IconGroup}
      style={returnGroupButtonStyle(getGroupingToggle())}
      onClick={() => { props.clickAction() }} />
  }

export default GroupButton;