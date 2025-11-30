import React, { useState, useEffect } from "react";

function PlaceDetails() {
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const placeName = "taj hotel"
  const [placeId, setPlaceId] = useState("");
  const [placeData, setPlaceData] = useState(null);
  useEffect(() => {
    const fetchPlaceId = async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
            placeName
          )}&inputtype=textquery&fields=place_id&key=${API_KEY}`
        );
        const data = await response.json();

        if (data.candidates && data.candidates.length > 0) {
          setPlaceId(data.candidates[0].place_id);
        } else {
          console.error("Place ID not found.");
        }
      } catch (error) {
        console.error("Error fetching Place ID:", error);
      }
    };

    fetchPlaceId();
  }, [placeName, API_KEY]);

  // Step 2: Fetch Place Details using Place ID
  useEffect(() => {
    if (!placeId) return; // Exit if no placeId is found

    const fetchPlaceDetails = async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,price_level,photos&key=${API_KEY}`
        );
        const data = await response.json();

        if (data.result) {
          setPlaceData(data.result);
        } else {
          console.error("No place details found.");
        }
      } catch (error) {
        console.error("Error fetching place details:", error);
      }
    };

    fetchPlaceDetails();
  }, [placeId, API_KEY]);

  return (
    <div>
      <h1>Place Details for "{placeName}"</h1>
      {placeData ? (
        <div>
          <h2>{placeData.name}</h2>
          <p>Rating: {placeData.rating}</p>
          <p>Price Level: {placeData.price_level}</p>
          {placeData.photos && placeData.photos.length > 0 && (
            <img
              src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${placeData.photos[0].photo_reference}&key=${API_KEY}`}
              alt={placeData.name}
              style={{ width: "100%", maxHeight: "300px", objectFit: "cover" }}
            />
          )}
        </div>
      ) : (
        <p>Loading place details...</p>
      )}
    </div>
  );
}

export default PlaceDetails;
