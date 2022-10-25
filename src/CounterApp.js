import React from 'react';
import BackwardCounter from './components/Counter/BackwardCounter';
import ForwardCounter from './components/Counter/ForwardCounter';

function App() {
  return (
    <React.Fragment>
      <ForwardCounter />
      <BackwardCounter />
    </React.Fragment>
  );
}

export default App;
