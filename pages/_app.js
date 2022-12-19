import "../styles/globals.css";
import { useRouter } from "next/router";
import Layout from "../src/components/MeetUp/layout/Layout";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  if (router.pathname.includes("Meetup")) {
    return (
      <Layout>
        <Component {...pageProps} />
      </Layout>
    );
  }
  return <Component {...pageProps} />;
}

export default MyApp;
