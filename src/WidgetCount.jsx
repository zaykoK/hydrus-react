function WidgetCount(props) {
    if (props.count === undefined) { return }

    let count = ''
    if (props.count != undefined) { count = props.count }

    const widgetStyle = {
        position: 'absolute',
        bottom: '0px',
        left: '0px',
        right: '0px',
        margin: 'auto',
        background: '#000000d1',
        padding: '3px',
        borderRadius: '5px 5px 0px 0px',
        opacity: '0.85',
        width: 'min-content',
        pointerEvents: 'none'
    }

    return <div style={widgetStyle}>{count}</div>
}
export default WidgetCount