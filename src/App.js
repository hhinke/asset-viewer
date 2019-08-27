import React, { useState } from 'react';
import axios from 'axios';

import './App.css';
import ReportDispatcher from 'jest-jasmine2/build/jasmine/ReportDispatcher';

export default function App() {
  const API_KEY = '<YOUR_APIKEY_HERE>';
  const [bestMatches, setBestMatches] = useState(null);
  const [currentChartData, setCurrentChartData] = useState(null);

  async function loadSearch(event) {
    const searchAsset = event.target.value;
    if(searchAsset.length < 4) {
      setBestMatches(null);
      return;
    }

    const response = await axios.get(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${searchAsset}&apikey=${API_KEY}`);
    const { status, statusText } = response;
    console.log(response);

    if(status === 200 && statusText === 'OK') {
      const { bestMatches } = response.data;
      if(bestMatches && bestMatches.length > 0) {
        const filteredBestMatches = bestMatches.filter((match, index) => index < 3);
        setBestMatches(filteredBestMatches);
      }  
    }
  }

  async function loadChart(event) {
    const assetName = event.currentTarget.dataset.id;

    const response = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${assetName}&interval=30min&apikey=${API_KEY}`);
    const { status, statusText } = response;
    console.log(response);

    if(status === 200 && statusText === 'OK') {
      const keys = Object.keys(response.data);
      if(keys.length === 2) {
        const rawChartData = response.data[keys[1]];
        const rawChartDataKeys = Object.keys(rawChartData);
        if(rawChartDataKeys.length > 0) {
          let chartData = [];
          rawChartDataKeys.map(rawKey => {
            chartData.push({
              datetime: rawKey,
              closing: rawChartData[rawKey]['4. close']
            });
          });

          console.log('before', chartData);
          const today = new Date();
          const date  = today.getFullYear() + '-'
             + ('0' + (today.getMonth()+1)).slice(-2) + '-' 
             + ('0' + (today.getDate()-1)).slice(-2);
          console.log(date);
          chartData = chartData.filter(item => {
            return item.datetime.includes(date);
          });

          setCurrentChartData(chartData);
          console.log('after', chartData);
        } else {
          setCurrentChartData(null);
        }
      } else {
        setCurrentChartData(null);
      }
    } else {
      setCurrentChartData(null);
    }
  }

  return (
    <div className="main-container">
      <input id='assetName' 
            type='text' 
            placeholder='Asset Name' 
            onChange={e => loadSearch(e)}>              
      </input>
      { bestMatches != null ? (
        <div className="results-container">
          <ul className="results-list">
            { bestMatches.map(match => (
              <li key={match['1. symbol']} 
                  data-id={match['1. symbol']} 
                  onClick={loadChart}>
                <h3>{match['1. symbol']}</h3>
                <p>{match['2. name']}</p>
              </li> 
            )) }
          </ul>
        </div>
      ) : (
        <div className="empty-search">
          <h4>No results found :(</h4>
        </div>
      )}
    </div>
  );
}
