import React from "react";

function Detail(props){
  console.log(props);
  return <span>Hello</span>

}
export default Detail;

export async function getServerSideProps(context){
  console.log(context.query) 
  return {
      props: { 
         title: context.query.title 
      }
  }
}