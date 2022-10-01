import * as React from 'react';

import { isLandscapeMode, isMobile } from '../styleUtils';

import './FileContent.css'


import Content from './Content';

interface FileContentProps {
  hash: string | undefined;
  type: string;
  setTranscodedHash:Function;
  setTopBarVisible:Function;
}

export function FileContent(props: FileContentProps) {

  function getContentWrapperStyle(): string {
    let style = 'contentWrapper'
    if (isMobile()) {
      style += ' mobile'
      //if (isLandscapeMode() && !props.type.includes('video')) { style += ' landscape' }
    }

    return style
  }
  return (
    <div key={"FileContent-" + props.hash} className={getContentWrapperStyle()} >
      <Content type={props.type} hash={props.hash} setTranscodedHash={props.setTranscodedHash} setTopBarVisible={props.setTopBarVisible} />
    </div>
  );
};
export const MemoFileContent = React.memo(FileContent);