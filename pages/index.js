import App from "../Components/App";
import Navigation from "../Components/Navigation";
import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Movie APP</title>
      </Head>
      <Navigation />
      <App />
    </>
  )
}
