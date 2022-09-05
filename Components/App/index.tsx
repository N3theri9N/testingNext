import { NextPage } from 'next';
import React from 'react';

interface AppProps {
  text : string
}

const App: NextPage<AppProps> = ( { text = "HelloWorld" } ) : JSX.Element => {
  return <h2>{text}</h2>
}

export default App;
