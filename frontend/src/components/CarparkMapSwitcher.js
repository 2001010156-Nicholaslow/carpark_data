import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import CarparkMap_Gmap from './CarparkMap_Gmap';  // Google Maps component
import CarparkMap_leaflet from './CarparkMap_leaflet';  // Leaflet Map component

const CarparkMapSwitcher = () => {
  const [activeMap, setActiveMap] = useState('google'); // default to Google Map
  const [dropdownOpen, setDropdownOpen] = useState(false); // To toggle dropdown visibility
  const [refreshKey, setRefreshKey] = useState(0); // Key to trigger re-render

  // Switch map function
  const switchMap = (mapType) => {
    setActiveMap(mapType);
    setDropdownOpen(false);  // Close dropdown when map is switched
  };

  // Refresh data function (you can replace this with actual data refreshing logic)
  const refreshData = () => {
    // Simply update the refreshKey to trigger a re-render
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* More Options Button */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          cursor: "pointer",
          fontSize: "20px",
        }}
        onClick={() => setDropdownOpen(!dropdownOpen)} // Toggle dropdown on click
      >
        <FontAwesomeIcon icon={faEllipsisH} />
      </div>

      {/* Refresh Button */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '60px', // Place it to the left of the More Options button
          zIndex: 1000,
          cursor: 'pointer',
          fontSize: '20px',
        }}
        onClick={refreshData} // Trigger refresh on click
      >
        <FontAwesomeIcon icon={faSyncAlt} />
      </div>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div
          style={{
            position: 'absolute',
            top: '50px', // Position below the More Options button
            right: '20px',
            zIndex: 1000,
            background: 'white',
            borderRadius: '5px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <label style={{ marginRight: '10px' }}>Google Map</label>
            <button
              onClick={() => switchMap('google')}
              style={{
                padding: '5px 10px',
                backgroundColor: activeMap === 'google' ? 'lightgreen' : 'lightgray',
                borderRadius: '5px',
                border: 'none',
              }}
            >
              On
            </button>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <label style={{ marginRight: '10px' }}>Leaflet Map</label>
            <button
              onClick={() => switchMap('leaflet')}
              style={{
                padding: '5px 10px',
                backgroundColor: activeMap === 'leaflet' ? 'lightgreen' : 'lightgray',
                borderRadius: '5px',
                border: 'none',
              }}
            >
              On
            </button>
          </div>
        </div>
      )}

      {/* Display the selected map */}
      {activeMap === 'google' ? (
        <CarparkMap_Gmap key={refreshKey} />
      ) : (
        <CarparkMap_leaflet key={refreshKey}/>
      )}
    </div>
  );
};

export default CarparkMapSwitcher;
