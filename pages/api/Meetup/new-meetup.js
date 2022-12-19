// POST /api/Meetup/new-meetup
// import { MongoClient } from 'mongodb'

async function handler(req, res){
  if(req.method === 'POST'){
    // const data = req.body;
    // // database insertion
    // const client = await MongoClient.connect("mongodb+srv://nnea5215:EBEIYXjHoRn9CARw@cluster0.7ixgtel.mongodb.net/meetups?retryWrites=true&w=majority");
    // const db = client.db();

    // const meetupsCollection = db.collection('meetups');

    // const result = await meetupsCollection.insertOne(data);

		// console.log(result);

    // client.close();

    res.status(201).json({message: 'Meetup inserted!'});
  }

}

export default handler;