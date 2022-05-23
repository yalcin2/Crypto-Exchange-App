// Import modules
import React, { Component, useEffect, useState, useMemo } from "react";
import { MDBTable, MDBTableBody, MDBTableHead } from 'mdb-react-ui-kit';
import Table from 'react-bootstrap/Table'
import Pusher from 'pusher-js';
import Pagination from '../misc/pagination/pagination';
import DatePicker from 'react-datepicker'
import Dropdown from 'react-dropdown';
import { SortTypes } from '../misc/sorting/sortTypes';
import Axios from 'axios';
import Modal from '../misc/modal/exchangeSuccessModal';

// Import css files
import './history.css';
import "react-datepicker/dist/react-datepicker.css";

// Should be configurable rather then hardcoded
const serverUrl = "http://localhost:4000/"

const api = Axios.create({baseURL: serverUrl})
const today = new Date()

var dateFilterActive = false;

function App() {
  // Initializing all the state variables  
  const [exchHistories, setExchangeHistory] = useState([]);
  const [newExchHistories, setNewExchangeHistory] = useState([]);
  const [initialize, setInitialize] = useState(true);
  const [isOpen, setOpenState] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [PageSize, setPageSize] = useState(10);
  const [startDate, setStartDate] = useState(today.setDate(today.getDate() - 3));
  const [endDate, setEndDate] = useState(today.setDate(today.getDate() + 4));
  const [options, setOptions] = useState(["All", "Live Price", "Exchanged"]);
  const [typeSelected, setTypeSelected] = useState("All");
  const [latestSort, setLatestSort] = useState('default');
  const [currentSortDate, setCurrentSortDate] = useState('default_dateTime');
  const [currentSortAmount1, setCurrentSortAmount1] = useState('default_amount1');
  const [currentSortCurrFrom, setCurrentSortCurrFrom] = useState('default_currencyFrom');
  const [currentSortAmount2, setCurrentSortAmount2] = useState('default_amount2');
  const [currentSortCurrTo, setCurrentSortCurrTo] = useState('default_currencyTo');
  const [currentSortType, setCurrentSortType] = useState('default_type');
  const [modalDateTime, setModalDateTime] = useState();
  const [modalType, setModalType] = useState();
  const [modalFrom, setModalFrom] = useState();
  const [modalTo, setModalTo] = useState();
  const [modalAmount1, setModalAmount1] = useState();
  const [modalAmount2, setModalAmount2] = useState();

  // On render of the history component, get all the exchange histories and subscribe to a pusher app to listen for
  // incoming messages from the server.
  useEffect(() => {
    setInitialize(prevState => {
      if(prevState){
        getAllExchangeHistories().then(() =>{
          // Initialize the pusher app
          var pusher = new Pusher('8944e495602f20cbcfde', {
            cluster: 'eu'
          })
  
          // Listen to new messages on the pusher app
          var channel = pusher.subscribe('fullstack-app');
  
          // Push the data to an array after capturing data
          channel.bind('inserted_histories', function(data) {
            setExchangeHistory(previousState => {
              return previousState.concat(data);
            });
          })
        });
      }

      return false;
    });
  }, []) 

  // After retrieving the new data with the pusher app from the server, sort the array by date time.
  useEffect(() => {
    // Activate the filter after the array has more then 0 records.
    if(exchHistories.length > 0 && !dateFilterActive){
      dateFilterActive = true;
    }
    else if(dateFilterActive){
      filterWithDateTime("All", true);
    }
  }, [exchHistories]) 
  

  // Get all the exchange histories from the API with the Axios module.
  function getAllExchangeHistories() {
    return new Promise(resolve => {
      api.get('exchange-history')
      .then((response) => {
        let res = response.data;

        // Set the full data retrieved to the state variables
        setExchangeHistory(res.reverse())
        setNewExchangeHistory(res);
        resolve();
      })
      .catch(err => { // Catch any error and log it to the console
        console.log(err);
      });
    })
  }

  // When this function is called, it will use the 'exchHistories' array, sort the data according to the sorting type selected
  // and then add the new data to a new array for it to be displayed.
  const currentTableData = () => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return newExchHistories.sort(SortTypes[latestSort].fn).slice(firstPageIndex, lastPageIndex)
  };

  // Format the date time into a readable format
  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString()
  }

  // Filter the existing exchange histories with the from and to date times selected and
  // add them to a new array to be displayed.
  const filterWithDateTime = (ovverideType, showAll) => {
    setDefaultSortForAll();
    
    setNewExchangeHistory(prevState => {
      let newState = [];

      exchHistories.forEach(exchHistory => {
        let historyType = exchHistory.type;
        let typeToUse = ovverideType ? ovverideType : typeSelected;
        let dateToCheck = new Date(exchHistory.createdAt).getTime();
        let from = (typeof startDate !== "number") ? startDate.getTime() : startDate
        let to = (typeof endDate !== "number") ? endDate.getTime() : endDate

        // if the exchange history record was saved between the dates from and to (dates to check), then show it
        if(!showAll){
          if(dateToCheck >= from && dateToCheck <= to) {
            if(typeToUse === "All")
              newState.push(exchHistory);
            else if(historyType === typeToUse) 
              newState.push(exchHistory);
          }
        } else newState = exchHistories
      })

      newState = newState.sort((a,b) => {
        return new Date(a.createdAt).getTime() - 
            new Date(b.createdAt).getTime()
      }).reverse();

      return newState;
    })
  }

  // Set the default sorting types for all options
  function setDefaultSortForAll(){
    setLatestSort('default');
    setCurrentSortDate('default_dateTime');
    setCurrentSortAmount1('default_amount1');
    setCurrentSortCurrFrom('default_currencyFrom');
    setCurrentSortAmount2('default_amount2');
    setCurrentSortCurrTo('default_currencyTo');
    setCurrentSortType('default_type');
    setTypeSelected('All');
  }

  // Wvery time the sort button is clicked, it will change the latestSort value to the next one
	function onSortChange(sortButton) {
		let nextSort;

    setDefaultSortForAll()

    // Each column has its own sorting type that can be configured from an external script (sortTypes.js).
    switch(sortButton) {
      case "dateTime":
        if (currentSortDate === 'down_dateTime') nextSort = 'up_dateTime';
        else if (currentSortDate === 'up_dateTime') nextSort = 'default_dateTime';
        else if (currentSortDate === 'default_dateTime') nextSort = 'down_dateTime';
    
        setCurrentSortDate(nextSort);
        break;
      case "currencyFrom":
        if (currentSortCurrFrom === 'down_currencyFrom') nextSort = 'up_currencyFrom';
        else if (currentSortCurrFrom === 'up_currencyFrom') nextSort = 'default_currencyFrom';
        else if (currentSortCurrFrom === 'default_currencyFrom') nextSort = 'down_currencyFrom';

        setCurrentSortCurrFrom(nextSort);
        break;
      case "amount1":
        if (currentSortAmount1 === 'down_amount1') nextSort = 'up_amount1';
        else if (currentSortAmount1 === 'up_amount1') nextSort = 'default_amount1';
        else if (currentSortAmount1 === 'default_amount1') nextSort = 'down_amount1';

        setCurrentSortAmount1(nextSort);
        break;
      case "currencyTo":
        if (currentSortCurrTo === 'down_currencyTo') nextSort = 'up_currencyTo';
        else if (currentSortCurrTo === 'up_currencyTo') nextSort = 'default_currencyTo';
        else if (currentSortCurrTo === 'default_currencyTo') nextSort = 'down_currencyTo';

        setCurrentSortCurrTo(nextSort);
        break;
      case "amount2":
        if (currentSortAmount2 === 'down_amount2') nextSort = 'up_amount2';
        else if (currentSortAmount2 === 'up_amount2') nextSort = 'default_amount2';
        else if (currentSortAmount2 === 'default_amount2') nextSort = 'down_amount2';

        setCurrentSortAmount2(nextSort);
        break;
      case "type":
        if (currentSortType === 'down_type') nextSort = 'up_type';
        else if (currentSortType === 'up_type') nextSort = 'default_type';
        else if (currentSortType === 'default_type') nextSort = 'down_type';

        setCurrentSortType(nextSort);
        break;
    }

    setLatestSort(nextSort);
	};

  // Enable the modal/pop-up and set the value for the clicked record to the state variables.
  function toggleModal (state, value) {
    setOpenState(state);

    if(value){
      setModalDateTime(formatDateTime(value.createdAt));
      setModalType(value.type);
      setModalFrom(value.currencyFrom);
      setModalTo(value.currencyTo);
      setModalAmount1(value.amount1.toFixed(6));
      setModalAmount2(value.amount2.toFixed(6));
    }
  }

  function filterByType(val){
    setTypeSelected(val)

    //filterWithDateTime(val)
  }

  return (
  <div className="App">
    <Modal children="test"show={isOpen}
    onClose={() => toggleModal(false)}>
      <h1>Transaction History</h1>
      <Table responsive size="sm">
        <thead>
          <tr>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>                
              <p className='fieldText'>Date & Time</p>
            </td>
            <td>                
              <p className='smallText'>{modalDateTime}</p>
            </td>
          </tr>
          <tr>
            <td>                
              <p className='fieldText'>Status</p>
            </td>
            <td>                
              <p className={`smallText type-${modalType}`}>{modalType}</p>
            </td>
          </tr>
          <tr>
            <td>                
              <p className='fieldText'>From</p>
            </td>
            <td>                
              <p className='smallText'>{modalFrom}</p>
            </td>
          </tr>
          <tr>
            <td>                
              <p className='fieldText'>To</p>
            </td>
            <td>                
              <p className='smallText'>{modalTo}</p>
            </td>
          </tr>
          <tr>
            <td>                
              <p className='fieldText'>Amount 1</p>
            </td>
            <td>                
              <p className='smallText'>{modalAmount1}</p>
            </td>
          </tr>
          <tr>
            <td>                
              <p className='fieldText'>Amount 2</p>
            </td>
            <td>                
              <p className='smallText'>{modalAmount2}</p>
            </td>
          </tr>
        </tbody>
      </Table>
    </Modal>
    <div>
      <h2 className="historyTitle">History</h2>
    </div>
    <div className ="main-container">
      <div id="wrapperDiv">
        <div className="date-picker-from" >
          <h3>Date from</h3>
          <DatePicker timeFormat="HH:mm" selectsStart 
                      className="date-picker"
                      selected={startDate} showTimeSelect  
                      dateFormat="d/MM/yyyy HH:mm:ss" 
                      onChange={(date) => setStartDate(date)} 
                      startDate={startDate}
                      endDate={endDate}/>
        </div>
        <div className="date-picker-to" >
          <h3>Date to</h3>
          <DatePicker timeFormat="HH:mm" selectsEnd 
                      className="date-picker"
                      selected={endDate} showTimeSelect  
                      dateFormat="d/MM/yyyy HH:mm:ss" 
                      onChange={(date) => setEndDate(date)}
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate} />
        </div>
        <div className="picker-dropdown" >
        <Dropdown className="dropdown-button" onChange={(e) => { filterByType(e.value) }} placeholder="All" options={options} />
        </div>
        <div className="picker-button" >
        <button className="filter-button btn btn-info" onClick={()=>{ filterWithDateTime() }}>Filter</button>
        </div>
      </div>
      <MDBTable striped hover>
        <MDBTableHead>
          <tr>
            <th scope='col' className="historyField">
              <button className="btn btn-black button-sort" onClick={() => {onSortChange("dateTime")}}><i className={`fas fa-${SortTypes[currentSortDate].class}`} /></button>
              Date & Time
            </th>
            <th scope='col' className="historyField">
              <button className="btn btn-black button-sort" onClick={() => {onSortChange("currencyFrom")}}><i className={`fas fa-${SortTypes[currentSortCurrFrom].class}`} /></button>
              Currency From
            </th>
            <th scope='col' className="historyField">
              <button className="btn btn-black button-sort" onClick={() => {onSortChange("amount1")}}><i className={`fas fa-${SortTypes[currentSortAmount1].class}`} /></button>
              Amount 1
            </th>
            <th scope='col' className="historyField">
              <button className="btn btn-black button-sort" onClick={() => {onSortChange("currencyTo")}}><i className={`fas fa-${SortTypes[currentSortCurrTo].class}`} /></button>
              Currency To
            </th>
            <th scope='col' className="historyField">
             <button className="btn btn-black button-sort" onClick={() => {onSortChange("amount2")}}><i className={`fas fa-${SortTypes[currentSortAmount2].class}`} /></button>
              Amount 2
            </th>
            <th scope='col' className="historyField">
              <button className="btn btn-black button-sort" onClick={() => {onSortChange("type")}}><i className={`fas fa-${SortTypes[currentSortType].class}`} /></button>
              Type
            </th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
        {currentTableData().map((val, key) => {
          return (
            <tr className="tableData" key={key} onClick={() => toggleModal(true, val)}>
              <td className="td-normal">{formatDateTime(val.createdAt)}</td>
              <td className="td-normal">{val.currencyFrom}</td>
              <td className="td-normal">{val.amount1.toFixed(6)}</td>
              <td className="td-normal">{val.currencyTo}</td>
              <td className="td-normal">{val.amount2.toFixed(6)}</td>
              <td className={`type-${val.type}`}>{val.type}</td>
            </tr>
          )
        })}
        </MDBTableBody>
      </MDBTable>
      <Pagination
        className="pagination-bar"
        currentPage={currentPage}
        totalCount={newExchHistories.length}
        pageSize={PageSize}
        onPageChange={page => setCurrentPage(page)}
      />
    </div>
  </div> 
  )
}
  
export default App;