import React, { useState, useEffect } from 'react';

const PlacesList = () => {
  const LOCATION = '26.9124,75.7873'; 
  const RADIUS = 5000; 
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; 

  const [places, setPlaces] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${LOCATION}&radius=${RADIUS}&type=restaurant&key=${API_KEY}`,
          {
            mode: 'no-cors', 
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPlaces(data.results);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      }
    };

    fetchPlaces();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Nearby Restaurants & Cafes in Jaipur</h1>
      {places.length > 0 ? (
        places.map((place, index) => (
          <div key={index} className="place-card">
            <h2>{place.name}</h2>
            <p>Address: {place.vicinity}</p>
            <p>Rating: {place.rating || 'N/A'}</p>
            <p>Price Level: {place.price_level || 'N/A'}</p>
          </div>
        ))
      ) : (
        <p>No places found.</p>
      )}
    </div>
  );
};

export default PlacesList;
