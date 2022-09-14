import { NavigateFunction } from 'react-router-dom';
import TagButtonList from './TagButtonList';
import "./TagDisplay.css"

interface TagDisplayProps {
  tags:Array<Array<string>>;
  navigate?:NavigateFunction;
  removeTag?:Function;
}

function TagDisplay(props:TagDisplayProps) {
  return <div className="tagDisplayStyle">
    <TagButtonList tags={props.tags} navigate={props.navigate} removeTag={props.removeTag} />
  </div>;
}

export default TagDisplay