import React, { useState } from 'react';
import axios from 'axios';

import './App.css';

export default function App() {
  const [bestMatches, setBestMatches] = useState(null);

  async function loadSearch(event) {
    const API_KEY = '<YOUR_APIKEY_HERE>';
    const searchAsset = event.target.value;
    if(searchAsset.length < 4) {
      setBestMatches(null);
      return;
    }

    const response = await axios.get(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${searchAsset}&apikey=${API_KEY}`);

    const { bestMatches } = response.data;
    const filteredBestMatches = bestMatches.filter((match, index) => index < 3);
    setBestMatches(filteredBestMatches);

    console.log(filteredBestMatches);
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
              <li key={match['1. symbol']}>
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
