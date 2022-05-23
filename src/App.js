import './App.css';
import React, { Component } from "react";
import Navbar from 'react-bootstrap/Navbar'

import Converter from "./component/converter/converter";
import History from "./component/history/history";

class App extends Component {
  constructor(props){
    super(props);
    this.state = { };
  }
  
  render(){
    return (
      // React fragment allows multiple components to be displayed in the same render
      <React.Fragment>
          <Navbar className="App-header">
              <Converter />
          </Navbar>
        <div className="App-footer">
          <History />
        </div>
      </React.Fragment>
    )
  }
}

export default App;
