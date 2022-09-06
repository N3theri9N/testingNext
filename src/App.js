import React from "react";
import axios from "axios";

class App extends React.Component {
  state = {
    isLoading: true,
    movies: []
  }
  
  getMovies = async () => {
    const { data : { data : { movies }}} = await axios.get('https://yts-proxy.now.sh/list_movies.json'); 
    this.setState({movies, isLoading : false});
  }

  componentDidMount(){
    this.getMovies();  
  }

  render () {
    return <div>{this.state.isLoading ? 'Loading...' : 'Running'}</div>
  };
}

export default App;