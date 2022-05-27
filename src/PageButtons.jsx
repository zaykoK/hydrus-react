export function PageButtons(props) {
  //console.log(props)
  function ButtonNextPage(props) {
    return <button style={PageButtonStyle} onClick={() => { props.changePage(props.page) }}>Next Page</button>;
  }
  function ButtonPreviousPage(props) {
    return <button style={PageButtonStyle} onClick={() => { props.changePage(props.page) }}>Previous Page</button>;
  }
  function ButtonPage(props) {
    return <button style={props.style} onClick={() => { props.changePage(props.page) }}>{props.page}</button>
  }

  const PageButtonStyle = {
    borderRadius: '5px',
    border: 'none',
    height: '30px',
    fontSize: 'larger',
    background: '#333333',
    color: 'white',
    cursor:'pointer'
  }

  const currentPageButtonStyle = {
    borderRadius: '5px',
    border: 'none',
    height: '25px',
    fontSize: 'larger',
    background: '#555555',
    color: 'white',
    cursor:'pointer'
  }
  //console.log(props.currentPage)
  if (props.pages === 1) { return <></> }
  let pageButtons = []

  //Draw previous page button
  if (props.currentPage != 1) { pageButtons.push(<ButtonPreviousPage key={'pageprev'} changePage={props.changePage} page={props.currentPage - 1} />) }

  //Amount of buttons to draw +- from current page
  let offset = props.offset;

  //Draw first page button when page above 21
  if (props.currentPage === 1) {
    pageButtons.push(<ButtonPage style={currentPageButtonStyle} key={'page1'} changePage={props.changePage} page={1} />)
  }
  else {
    pageButtons.push(<ButtonPage style={PageButtonStyle} key={'page1'} changePage={props.changePage} page={1} />)
  }

  if (props.currentPage - offset > 2) {
    pageButtons.push(<span key="pages before dots">...</span>)
  }
  //Draw current+-6 pages
  for (let i = Math.max(2, props.currentPage - offset); i <= Math.min(props.pages, props.currentPage + offset); i++) {
    if (i === props.currentPage) {
      pageButtons.push(<ButtonPage style={currentPageButtonStyle} key={'page' + i} changePage={props.changePage} page={i} />)
    }
    else {
      pageButtons.push(<ButtonPage style={PageButtonStyle} key={'page' + i} changePage={props.changePage} page={i} />)
    }
    if (i + 1 > Math.min(props.pages, props.currentPage + offset) && (i + 1 < props.pages)) {
      pageButtons.push(<span key="pages dots">...</span>)
    }
  }

  //Last Page
  if (props.currentPage + offset < props.pages) {
    pageButtons.push(<ButtonPage style={PageButtonStyle} key={'page' + props.pages} changePage={props.changePage} page={props.pages} />)
  }
  //Draw next Page Button
  if (props.currentPage != props.pages) { pageButtons.push(<ButtonNextPage key={'pagenext'} changePage={props.changePage} page={props.currentPage + 1} />) }

  const buttonListStyle = {
    position:'relative',
    bottom:'1em',
    left:'0px',
    right:'0px',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    gap: '5px',
    paddingTop:'20px',
    flexWrap:'wrap',
    maxWidth:'100vh'
  }

  return <div style={buttonListStyle}>{pageButtons}</div>
}