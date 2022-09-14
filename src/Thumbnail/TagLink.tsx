import './TagLink.css'

import { addTag } from '../SearchPage/SearchPageHelpers'
import { NavigateFunction, useNavigate } from 'react-router-dom';

interface TagLinkProps {
    style: any;
    tag: string;
    namespace: string;
    navigate:NavigateFunction;
}

function TagLink(props: TagLinkProps) {

    return <span
        className='tagLink'
        key={props.tag}
        style={props.style}
        onClick={() => {
            if (props.namespace === '') {
                addTag(props.tag,props.navigate,'image')
            }
            else {
                addTag(props.namespace + ':' + props.tag,props.navigate,'image')
            }
        }}
    >
        {props.tag}
    </span>
}

export default TagLink