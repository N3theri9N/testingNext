import ListItem from '../ListItem';
import styles from './YTMain.module.css';

function YTMain(props){
    return (
        <div>
            <h2>YT MAIN : LIST PART</h2>
            <ul className={styles.list}>
                { props.items.map(item => <ListItem 
                    key={item.etag}
                    title={item.snippet.title}
                    description={item.snippet.description}
                    thumbnails={item.snippet.thumbnails.medium.url}
                    publishedAt={item.snippet.publishedAt}
                />) }
            </ul>
        </div>
    )
}

export default YTMain;
