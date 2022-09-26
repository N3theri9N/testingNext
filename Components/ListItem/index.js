import styles from "./ListItem.module.css"

export default function ListItem({title, description, thumbnails, publishedAt}){
    
  function decodeHTMLEntities (str) {
    if(str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
    }
    return str;
  }

    
    return (
        <li>
            <div className={styles.item}>
                <h4 className={styles.title}>{decodeHTMLEntities(title)}</h4>
                <img src={thumbnails} />
                <span className={styles.desc}>{decodeHTMLEntities(description)}</span>
                <span>{publishedAt}</span>
            </div>
        </li>
    )   
}