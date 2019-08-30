import React, { useState } from 'react';
import axios from 'axios';
import { Tooltip, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';

import './App.css';

export default function App() {
  const API_KEY = '<YOUR_APIKEY_HERE>';
  const [bestMatches, setBestMatches] = useState(null);
  const [currentChartData, setCurrentChartData] = useState(null);
  const [clickedAssetName, setClickedAssetName] = useState('');

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
    setCurrentChartData(null);

    const assetName = event.currentTarget.dataset.id;
    setClickedAssetName(assetName);

    const response = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${assetName}&interval=30min&outputsize=full&apikey=${API_KEY}`);
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

          // const today = new Date();
          // const date  = today.getFullYear() + '-'
          //    + ('0' + (today.getMonth()+1)).slice(-2) + '-' 
          //    + ('0' + (today.getDate()-1)).slice(-2);
          
          // chartData = chartData.filter(item => {
          //   return item.datetime.includes(date);
          // });

          chartData = chartData.reverse();
          setCurrentChartData(chartData);
          console.log(chartData);
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
                { currentChartData && clickedAssetName === match['1. symbol'] && (
                   <LineChart width={700} height={400} data={currentChartData} >
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey="datetime" hide={true} />
                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="closing" stroke="#8884d8" dot={false} />
                  </LineChart>
                ) }
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
