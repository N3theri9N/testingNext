import axios from 'axios';

export async function getListService(){
    // 이를 상대주소로 바꿔볼 수 있을까?
    // const dataResult = await axios({
    //     method: 'get',
    //     url : 'http://localhost:3000/api/contentList',
    // });

    //const dataResult = await fetch('/api/contentList')
    const dataResult = await axios({
        method: 'get',
        url: 'https://www.googleapis.com/youtube/v3/search/?',
        params: {
            key: "AIzaSyC1SOJHzUQmb14TrBMl5k-LRtkB2j62bxQ",
            part: "snippet",
            maxResults : "20"
        }
    })
    const { items } = dataResult.data;
    return items;
}