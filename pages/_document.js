import Document, { Html, Head, Main, NextScript } from "next/document";

class Doc extends Document {
  render() {
    return (
    <Html>
      <body>       
        <Head /> 
        <div id="backdrop-root"></div>
        <div id="overlay-root"></div>
        <div id="overlays"></div>
        <Main />
        <NextScript />
      </body>
    </Html>
    );
  }
}

export default Doc;