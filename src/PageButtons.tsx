import React from "react";

import './PageButtons.css'

interface PageButtonsProps {
  pages: number;
  currentPage: number;
  changePage: Function;
  offset: number;

}

function PageButtons(props: PageButtonsProps) {

  function ButtonNextPage(props: { changePage: Function, className: string, page: number }) {
    return <button className={props.className} onClick={() => { props.changePage(props.page) }}>Next Page</button>;
  }
  function ButtonPreviousPage(props: { changePage: Function, className: string, page: number }) {
    return <button className={props.className} onClick={() => { props.changePage(props.page) }}>Previous Page</button>;
  }
  function ButtonPage(props: { changePage: Function, className: string, page: number }) {
    return <button className={props.className} onClick={() => { props.changePage(props.page) }}>{props.page}</button>
  }

  //console.log(props.currentPage)
  if (props.pages === 1) { return <></> }
  let pageButtons = []

  //Draw previous page button
  if (props.currentPage != 1) { pageButtons.push(<ButtonPreviousPage className="pageButton" key={'pageprev'} changePage={props.changePage} page={props.currentPage - 1} />) }

  //Amount of buttons to draw +- from current page
  let offset = props.offset;

  //Draw first page button when page above 21
  if (props.currentPage === 1) {
    pageButtons.push(<ButtonPage className="pageButton current" key={'page1'} changePage={props.changePage} page={1} />)
  }
  else {
    pageButtons.push(<ButtonPage className="pageButton" key={'page1'} changePage={props.changePage} page={1} />)
  }

  if (props.currentPage - offset > 2) {
    pageButtons.push(<span key="pages before dots">...</span>)
  }
  //Draw current+-6 pages
  for (let i = Math.max(2, props.currentPage - offset); i <= Math.min(props.pages, props.currentPage + offset); i++) {
    if (i === props.currentPage) {
      pageButtons.push(<ButtonPage className="pageButton current" key={'page' + i} changePage={props.changePage} page={i} />)
    }
    else {
      pageButtons.push(<ButtonPage className="pageButton" key={'page' + i} changePage={props.changePage} page={i} />)
    }
    if (i + 1 > Math.min(props.pages, props.currentPage + offset) && (i + 1 < props.pages)) {
      pageButtons.push(<span key="pages dots">...</span>)
    }
  }

  //Last Page
  if (props.currentPage + offset < props.pages) {
    pageButtons.push(<ButtonPage className="pageButton" key={'page' + props.pages} changePage={props.changePage} page={props.pages} />)
  }
  //Draw next Page Button
  if (props.currentPage != props.pages) { pageButtons.push(<ButtonNextPage className="pageButton" key={'pagenext'} changePage={props.changePage} page={props.currentPage + 1} />) }



  return <div className="buttonList" >{pageButtons}</div>
}

export default PageButtons