// Import modules
import React from 'react';
import { useEffect, useState } from 'react';
import Axios from 'axios';
import Dropdown from 'react-dropdown';
import { HiSwitchHorizontal } from 'react-icons/hi';
import 'react-dropdown/style.css';
import './converter.css';
import Table from 'react-bootstrap/Table'
import { ToastContainer, toast } from 'react-toastify';
import Pusher from 'pusher-js';

// Import css files
import 'react-dropdown/style.css';
import './converter.css';
import 'react-toastify/dist/ReactToastify.css';

// Should be configurable rather then hardcoded...
const serverUrl = "http://localhost:4000/"
const api = Axios.create({baseURL: serverUrl})

function App() {
  // Initializing all the state variables  
  const [info, setInfo] = useState([]);
  const [input, setInput] = useState(0);
  const [from, setFrom] = useState("BTC");
  const [to, setTo] = useState("USD");
  const [options, setOptions] = useState([]);
  const [output, setOutput] = useState(0);

  // Calling the api whenever the dependency changes
  useEffect(() => {
    api.get(`exchange-rates`)
   .then((res) => {
      setInfo(res.data[0].rates[0]);

      // Initialize the pusher app
      var pusher = new Pusher('8944e495602f20cbcfde', {
        cluster: 'eu'
      })

      // Listen to new messages on the pusher app
      var channel = pusher.subscribe('fullstack-app');

      // Push the data to an array after capturing data
      channel.bind('inserted_rates', function(res) {
        setInfo(res.rates[0]);
      })
    })
  }, [from,to]);
  
  // Calling the convert function whenever
  // a user switches the currency
  useEffect(() => {
      setOptions(Object.keys(info));
      convert("toInput").then((res) => {
        console.log("Exchange rates updated!");
        if(res)
          document.getElementById("toInput").value = res.toFixed(7);
      })
    
  }, [info])
    

  // Function to convert the currency to crypto and vice versa
  function convert(toOrFrom, overrideInput) {
    return new Promise(function(resolve){
        let outputVal = 0;
        let inputToUse = overrideInput ? overrideInput : input;
        let rateFrom;
        let rateTo;

        if(toOrFrom === "toInput") {
          rateFrom = info[from]; 
          rateTo = info[to]; 

          outputVal = inputToUse / rateFrom;
          outputVal = outputVal * rateTo
        }
        else if(toOrFrom === "fromInput") {
          rateFrom = info[from]; 
          rateTo = info[to]; 

          outputVal = inputToUse * rateFrom;
          outputVal = outputVal / rateTo
        }
        
        setOutput(outputVal);
        resolve(outputVal);
    });
  }
  
  function saveToDB(){
    // Construct an object containing the data the server needs to process the message from the chat client.
    var exchangeHistory = {
      currencyFrom: from,
      amount1: input,
      currencyTo: to,
      amount2: output
    };

    // Minor validation to the inputs and warning display
    if(input <= 0 || output <= 0)
      toast.warn("Please input a valid amount.")
    else if(to === from)
      toast.warn("Cannot exchange the same currencies: " + to + " to " + from);
    else{
      // Send a POST request to the API with the data provided to be saved to MongoDB
      api.post('exchange-history', exchangeHistory)
      .then((response) => {
        // Notify the user that the transaction was saved.
        let res = response.data;
        toast.success('Exchanged ' + res.amount1.toFixed(2) + " " + res.currencyFrom + " to " + res.amount2.toFixed(2)  + " " + res.currencyTo);
      })
      .catch(err => {
        // Notify the user that the transaction failed.
        toast.error("Failed to exchange currencies! Data not saved.");
      });
    }
  }

  // Live convertion rate: Update the price within the input boxes on user input
  function updateAmount(toOrFrom, inputVal, inputCurr){
    setInput(inputVal);

    if(!inputCurr){
      if(toOrFrom === "fromInput"){
          if(inputVal > 0) {
              convert("toInput", inputVal).then((outputVal) => {
                document.getElementById("toInput").value = outputVal.toFixed(7);
              })
          } 
          else 
              document.getElementById("toInput").value = 0
      }
      else if(toOrFrom === "toInput"){
          if(inputVal > 0) {
              convert("fromInput", inputVal).then((outputVal) => {
                document.getElementById("fromInput").value = outputVal.toFixed(7);
              })
          } 
          else 
              document.getElementById("fromInput").value = 0
      }
    }
  }

  // After a currency is selected, update the 'to' input box to show the new converted amount
  function updateCurrency(chosenVal, toOrFrom){
    let fromInput= document.getElementById("fromInput").value;
    
    if(toOrFrom === "fromInput"){
      setFrom(chosenVal);
      updateAmount("fromInput", fromInput, true);
    }
    else if(toOrFrom === "toInput"){
      setTo(chosenVal);
      updateAmount("fromInput", fromInput, true);
    }
  }

  return (
    <div className="App">
      <ToastContainer />
      <div className ="main-container">
        <div>
            <h1 className="converterTitle">Exchange</h1>
        </div>
        <Table responsive size="md" >
          <thead>
            <tr>
              <th className='converterField'>Currency from</th>
              <th className='converterField'>Amount</th>
              <th></th>
              <th className='converterField'>Currency to</th>
              <th className='converterField'>Amount</th>
              <th className='converterField'></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>                
                <Dropdown options={options} onChange={(e) => { updateCurrency(e.value, "fromInput") }} value={from} placeholder="From" />
              </td>
              <td>
                <input id="fromInput" type="text" placeholder="Enter the amount" onChange={(e) => updateAmount("fromInput", e.target.value)} />
              </td>
              <td>                
                <div className="switch"> 
                  <HiSwitchHorizontal size="30px"/>
                </div>
              </td>
              <td>                
                <Dropdown options={options} onChange={(e) => {updateCurrency(e.value, "toInput")}} value={to} placeholder="To" />
              </td>
              <td>
                <input id="toInput" type="text" placeholder="Enter the amount" onChange={(e) => updateAmount("toInput", e.target.value)} />
              </td>
              <td>
                <button className="save-button btn btn-success" onClick={()=>{saveToDB()}}>Save</button>
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
    
  );
}
  
export default App;