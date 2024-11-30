import React, {
  useState,
  useEffect,
  useCallback,
  useMemo
} from "react";
import {
  GoogleMap,
  InfoWindow
} from "@react-google-maps/api";
import { getCarparkAvailability } from "../services/carparkService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCar
} from "@fortawesome/free-solid-svg-icons";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

const CarparkMap_Gmap = () => {
  const [carparks, setCarparks] = useState([]);
  const [selectedCarpark, setSelectedCarpark] = useState(null);
  const [loading, setLoading] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [userLocation, setUserLocation] = useState({
    lat: 1.3521, // Default to Singapore
    lng: 103.8198,
  });
  const [map, setMap] = useState(null); // Store map instance

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: true,
      zoomControl: false,
      gestureHandling: "cooperative", // Improved map movement performance
      mapTypeControl: true,
      styles: [
        {
          featureType: "poi",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit",
          stylers: [{ visibility: "simplified" }],
        },
      ],
    }),
    []
  );

  // Function to create a colored dot icon
  const createDotIcon = (color) => ({
    path: "M0,0 L2,0 A2,2 0 1,1 -2,0 A2,2 0 1,1 2,0 Z", // Smaller SVG path
    fillColor: color,
    fillOpacity: 1,
    scale: 6, // Smaller icon size
    strokeColor: "white",
    strokeWeight: 1,
  });

  // Adjust marker colors based on availability
  const getMarkerColor = (availability) => {
    if (availability >= 75) return "red"; // Overcrowded
    if (availability <= 25) return "green"; // Plenty of space
    return "orange"; // Moderate availability
  };

  // Function to create and store markers
  const createMarkers = useCallback((carparks, mapInstance) => {
    if (!mapInstance) return;

    const markers = carparks
      .filter((carpark) => carpark.gps)
      .map((carpark) => {
        const availability =
          (carpark.lots_available / carpark.total_lots) * 100;
        const color = getMarkerColor(availability);

        const marker = new window.google.maps.Marker({
          position: {
            lat: carpark.gps.latitude,
            lng: carpark.gps.longitude,
          },
          icon: createDotIcon(color),
          title: carpark.address,
        });

        // Attach click event
        marker.addListener("click", () => {
          setSelectedCarpark(carpark); // Set the selected carpark for InfoWindow
        });

        return marker;
      });

    // Initialize MarkerClusterer
    new MarkerClusterer({
      markers,
      map: mapInstance,
      gridSize: 60,
      minimumClusterSize: 5,
      maxZoom: 18,
    });

    return markers;
  }, []);

  // Fetch carpark data and update markers
  const fetchCarparks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCarparkAvailability();
      setCarparks(data);
      if (map) {
        createMarkers(data, map);
      }
    } catch (error) {
      console.error("Error in fetching carparks:", error);
    } finally {
      setLoading(false);
    }
  }, [createMarkers, map]);

  // Fetch carparks and set up location
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

  // Handle user click to center map on their location
  const goToUserLocation = () => {
    map.panTo(userLocation);
    map.setZoom(20); // Adjust zoom level
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        zoom={12}
        center={userLocation}
        options={mapOptions}
        onLoad={(mapInstance) => setMap(mapInstance)}
      >
        {markers}

        {/* InfoWindow */}
        {selectedCarpark && (
          <InfoWindow
            position={{
              lat: selectedCarpark.gps.latitude,
              lng: selectedCarpark.gps.longitude,
            }}
            onCloseClick={() => setSelectedCarpark(null)}
          >
            <div style={{ textAlign: "center" }}>
              <h3>{selectedCarpark.address}</h3>
              <p>
                <FontAwesomeIcon icon={faCar} /> Available Lots:{" "}
                {selectedCarpark.lots_available} / {selectedCarpark.total_lots}
              </p>
              <p>
                <strong>Last Updated:</strong>{" "}
                {new Date(selectedCarpark.update_datetime).toLocaleString()}
              </p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Carpark Finder Name at the Bottom Left */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          color: "#000000",
          fontSize: "28px",
          fontWeight: "bold",
          backgroundColor: "white"
        }}
      >
        Carpark Finder
      </div>

      {/* Zoom and Location Controls */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {/* Center on User Location */}
        <button
          onClick={() => goToUserLocation()}
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

        {/* Zoom In Button */}
        <button
          onClick={() => {
            if (map) {
              const currentZoom = map.getZoom();
              map.setZoom(currentZoom + 1); // Increment zoom level
            }
          }}
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

        {/* Zoom Out Button */}
        <button
          onClick={() => {
            if (map) {
              const currentZoom = map.getZoom();
              map.setZoom(currentZoom - 1); // Decrement zoom level
            }
          }}
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
    </div>
  );
};

export default CarparkMap_Gmap;
