import './WidgetCount.css'

interface WidgetCountProps {
    count: number | undefined;
}

function WidgetCount(props: WidgetCountProps) {
    if (props.count === undefined || props.count === 1) { return <></> }

    let count;
    if (props.count !== undefined) { count = props.count }

    return <div className="widgetCount">{count}</div>
}
export default WidgetCount