import React, { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import { getCarparkAvailability } from "../services/carparkService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCar
} from "@fortawesome/free-solid-svg-icons";
import MarkerClusterGroup from "react-leaflet-cluster";



// Fix for default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icon function
const createMarkerIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 20px; 
      height: 20px; 
      border-radius: 50%; 
      background-color: ${color};
      border: 2px solid white;
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const CarparkMap_leaflet = () => {
  const [carparks, setCarparks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState({
    lat: 1.3521, // Default to Singapore
    lng: 103.8198,
  });

  // Adjust marker colors based on availability
  const getMarkerColor = (availability) => {
    if (availability >= 75) return "red"; // Overcrowded
    if (availability <= 25) return "green"; // Plenty of space
    return "orange"; // Moderate availability
  };

  // Fetch carpark data 
  const fetchCarparks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCarparkAvailability();
      setCarparks(data);
    } catch (error) {
      console.error("Error in fetching carparks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch carparks and set up location on component mount
  useEffect(() => {
    fetchCarparks();
    const interval = setInterval(fetchCarparks, 300000); // 5-minute refresh

    // Get user location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => console.error("Error getting location", error)
    );

    return () => clearInterval(interval);
  }, [fetchCarparks]);

  // Custom component for map controls
  const MapControls = () => {
    const map = useMap();

    // Center map on user location
    const goToUserLocation = () => {
      map.setView([userLocation.lat, userLocation.lng], 20);
    };

    return (
      <>
        {/* Carpark Finder Name */}
        <div 
          style={{
            position: 'absolute', 
            bottom: '20px', 
            left: '20px', 
            zIndex: 1000,
            color: "#007bff",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          Carpark Finder
        </div>

        {/* Location and Zoom Controls */}
        <div 
          style={{
            position: 'absolute', 
            bottom: '20px', 
            right: '20px', 
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* Center on User Location */}
          <button
            onClick={goToUserLocation}
            style={{
              padding: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            <FontAwesomeIcon icon={faCar} />
          </button>

          {/* Zoom In/Out Buttons */}
          <button
            onClick={() => map.zoomIn()}
            style={{
              padding: "10px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            +
          </button>
          <button
            onClick={() => map.zoomOut()}
            style={{
              padding: "10px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            -
          </button>
        </div>
      </>
    );
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={12}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
      >
        {/* OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map Controls */}
        <MapControls />

        {/* Marker Clusters */}
        <MarkerClusterGroup>
          {carparks
            .filter((carpark) => carpark.gps)
            .map((carpark) => {
              const availability = 
                (carpark.lots_available / carpark.total_lots) * 100;
              const markerColor = getMarkerColor(availability);

              return (
                <Marker
                  key={carpark.address}
                  position={[carpark.gps.latitude, carpark.gps.longitude]}
                  icon={createMarkerIcon(markerColor)}
                >
                  <Popup>
                    <div style={{ textAlign: "center" }}>
                      <h3>{carpark.address}</h3>
                      <p>
                        <FontAwesomeIcon icon={faCar} /> Available Lots:{" "}
                        {carpark.lots_available} / {carpark.total_lots}
                      </p>
                      <p>
                        <strong>Last Updated:</strong>{" "}
                        {new Date(carpark.update_datetime).toLocaleString()}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default CarparkMap_leaflet;