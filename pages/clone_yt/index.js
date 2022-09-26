import Header from "../../Components/Header"
import YTMain from "../../Components/YTMain"
import { getListService } from "../../Components/YTMain/Services"

export default function Index(props){
    return (
        <div>
            <Header />
            <YTMain items={props.YTMainitems}/>
        </div>
    )
}

export async function getServerSideProps(context) {
    const YTMainitems = await getListService();
    return {
        props :{ YTMainitems }
    }
}
