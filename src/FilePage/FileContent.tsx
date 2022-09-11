import * as React from 'react';

import { isLandscapeMode, isMobile } from '../styleUtils';

import './FileContent.css'


import Content from './Content';

interface FileContentProps {
  hash: string | undefined;
  type: string;
  nextImage: Function;
  previousImage: Function;
  nextSearchImage: Function;
  previousSearchImage: Function;
}

export function FileContent(props: FileContentProps) {

  function getContentWrapperStyle() {
    if (isLandscapeMode() && !props.type.includes('video')) { return "contentWrapper mobile landscape" }
    return "contentWrapper"
  }
  return (
    <div id={"FileContent-" + props.hash} key={"FileContent-" + props.hash} className={getContentWrapperStyle()} >
      <Content type={props.type} hash={props.hash} nextImage={props.nextImage} previousImage={props.previousImage} nextSearchImage={props.nextSearchImage} previousSearchImage={props.previousSearchImage} />
    </div>
  );
};
export const MemoFileContent= React.memo(FileContent);