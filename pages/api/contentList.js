import axios from 'axios';

export default async function handler(req, res){
    if(req.method === "GET"){
        const dataResult = await axios({
            method: 'get',
            url: 'https://www.googleapis.com/youtube/v3/search/?',
            params: {
                key: "AIzaSyC1SOJHzUQmb14TrBMl5k-LRtkB2j62bxQ",
                part: "snippet",
                maxResults : "20"
            }
        })
        res.status(200).send(dataResult.data);
    } else {
        res.status(400).send("not Allowed");
    }
}