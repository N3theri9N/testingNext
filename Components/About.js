import React from "react";
import styles from "./About.module.css";

const About = () => {
  return (
    <div className="container">
      <div className={styles.about__container}>
        <span>
          "Freedom is he freedom to say that two plus to two make four. If that is granted, all else follows."
        </span>
        <span>- George Orwell, 1984</span>
      </div>
    </div>
  );
}

export default About;

