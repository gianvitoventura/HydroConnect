import React, { useState, useEffect } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

const GpsTracker = ({ isTracking }) => {
  const [userLocation, setUserLocation] = useState(null);
  const map = useMap();

  useEffect(() => {
    let watchId;

    if (isTracking) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = [position.coords.latitude, position.coords.longitude];
          setUserLocation(newLocation);
        },
        (error) => {
          console.error("Errore nel tracciamento GPS:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      // Quando il tracking viene disattivato, resettiamo la posizione
      setUserLocation(null);
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isTracking, map]);

  // Se il tracking è disattivato o non c'è una posizione, non renderizziamo il marker
  if (!isTracking || !userLocation) {
    return null;
  }

  const userLocationIcon = new L.divIcon({
    html: `<div class="user-location-dot"></div>`,
    className: 'user-location',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return (
    <Marker position={userLocation} icon={userLocationIcon} />
  );
};

export default GpsTracker;