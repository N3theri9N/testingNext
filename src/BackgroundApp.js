import React, { useCallback, useState } from 'react';

import Button from "./components/Background/UI/Button";

import style from './BackgroundApp.module.css';
import DemoOutput from './components/Background/Demo/DemoOutput';

function BackgroundApp() {
  const [showParagraph, setShowParagraph] = useState(false);
  const [allowToggle, setAllowToggle] = useState(false);

  const toggleParagraphHandler = useCallback(() => {
    if(allowToggle){
      setShowParagraph((prevParagraph) => !prevParagraph);
    }
  }, [allowToggle]);

  const allowtoggleHandler = () => {
    setAllowToggle(true);
  };

  return (
    <div className={style.app}>
      <h1>Hi there!</h1>
      <DemoOutput show={showParagraph} />
      <Button onClick={toggleParagraphHandler}>Toggle Paragraph!</Button>
      <Button onClick={allowtoggleHandler}>Allow Toggle</Button>
    </div>
  );
}

export default BackgroundApp;
