import './TagLink.css'

interface TagLinkProps {
    style: any;
    addTag: Function;
    tag: string;
    namespace: string;
}

function TagLink(props: TagLinkProps) {
    return <span
        className='tagLink'
        key={props.tag}
        style={props.style}
        onClick={() => {
            if (props.namespace === '') {
                props.addTag(props.tag)
            }
            else {
                props.addTag(props.namespace + ':' + props.tag)
            }
        }}
    >
        {props.tag}
    </span>
}

export default TagLink