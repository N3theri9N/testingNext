import { MongoClient } from "mongodb";
import Head from "next/head";

import MeetupList from "../../src/components/MeetUp/meetups/MeetupList";

// const DUMMY_MEETUPS = [
//   {
//     id: "m1",
//     title: "A First Meetup",
//     image:
//       "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Aachen_Germany_Imperial-Cathedral-01.jpg/800px-Aachen_Germany_Imperial-Cathedral-01.jpg",
//     address: "Some address 5, 16942 Some City",
//     descript: "this is a first Meetup!",
//   },
//   {
//     id: "m2",
//     title: "A Second Meetup",
//     image:
//       "https://upload.wikimedia.org/wikipedia/commons/5/55/Maria_Laach-16-2007-gje.jpg",
//     address: "Some address 1, 16340 Some City",
//     descript: "this is a second Meetup!",
//   },
// ];

function HomePage(props) {
  return (
    <>
      {/* <Head>
        <title>NextJS Meetups</title>
        <meta
          name="description"
          content="Browse a huge list of highly active React meetups"
        />
      </Head> */}
      <MeetupList meetups={props.meetups} />
    </>
  );
}

export async function getStaticProps() {
  // fetching data from API

  const client = await MongoClient.connect(
    "mongodb+srv://nnea5215:EBEIYXjHoRn9CARw@cluster0.7ixgtel.mongodb.net/meetups?retryWrites=true&w=majority"
  );
  const db = client.db();

  const meetupsCollection = db.collection("meetups");
  const meetups = await meetupsCollection.find().toArray();

  client.close();

  return {
    props: {
      meetups: meetups.map((meetup) => ({
        title: meetup.title,
        address: meetup.address,
        image: meetup.image,
        id: meetup._id.toString(),
      })),
    },
    revalidate: 1,
  };
}

// export async function getServerSideProps(context){
//   const req = context.req;
//   const res = context.res;
//   //   // fetching data from API
//   return {
//     props: {
//       meetups: DUMMY_MEETUPS
//     }
//   }
// }

export default HomePage;
