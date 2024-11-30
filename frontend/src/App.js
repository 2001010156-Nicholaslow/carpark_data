import React from 'react';
import { LoadScript } from '@react-google-maps/api';
import CarparkMap from './components/CarparkMap';
import CarparkMapSwitcher from './components/CarparkMapSwitcher'

function App() {
  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <div className="App">
        <CarparkMapSwitcher  />
      </div>
    </LoadScript>
  );
}

export default App;