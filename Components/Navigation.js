import Link from "next/link";
import React from "react";
import style from "./Navigation.module.css"

const Navigation = () => {
  return (
    <div className={style.nav}>
      <Link href="/">Home</Link>
      <Link href="/about">about</Link>
    </div>
  )
}

export default Navigation;