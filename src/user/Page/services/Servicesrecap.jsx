import React, { useRef, useState, useMemo, useEffect } from "react";
import moment from "moment/moment";
import { useNavigate } from "react-router-dom";
import { FaLongArrowAltLeft } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { clearAllVenues } from "../Redux/selectedVenuesSlice";
import { clearGoogleData } from "../Redux/GoogleData";
import { updateData } from "../Redux/formSlice";
import { addGoogleData } from "../Redux/GoogleData";
import LoadingSpinner from "../../compontents/LoadingSpinner";
import toast from "react-hot-toast";
import Listing from "../../../Api/Listing";


export default function ServicesRecap({ data, formData, id, description, setDescription, setGoogleLoading }) {
  const dispatch = useDispatch();
  const [loading, SetLoading] = useState(false);
  const priceText = {
    1: "Budget-friendly place",
    2: "Mid-range place with good value",
    3: "Higher-end place",
    4: "Luxury and premium option",
  };

  const generatePrompt = () => {
    return `
    You are my helpful assistant incorporated in my event organization Web app, We fetch suggestions of service providers from Google Maps, and I need you to sum up the event from the data, and give me price estimates, and ideas of the look and feel of my event from the form entries given by the user : 

 Input:
       Organizer Name: ${formData?.firstname || "Unknown"} ${formData?.lastname || "Unknown"}
       Contact Email: ${formData?.email || "Not provided"}
       Contact Number: ${formData?.phone_code || ""} ${formData?.number || "Not provided"}
       Event Type: ${formData?.event_type || "Not specified"}
       Number of People Attending: ${formData?.people || "Not specified"}
       Event Date: ${formData?.day || "DD"}-${formData?.month || "MM"}-${formData?.year || "YYYY"}
       Event Time: ${formData?.time || "Not specified"}
       Venue: A restaurant located at ${formData?.area || "Unknown location"}
       Food Options: ${formData?.food_eat || "Not specified"}
       Activities Planned: ${formData?.activity || "None specified"}
       Privatization of Place: ${formData?.Privatize_place || "Not specified"}
       Privatization of Activity: ${formData?.Privatize_activity || "Not specified"}
       Budget: ${priceText[formData?.firstname] || "Budget information not available"}
       Additional Details: ${formData?.details || "No additional details provided"}
      You will give : 1. From the given input above, give a creative description of the event, describing the look and feel of it, also some suggestions of how they can enhance the envent. 2. A sentence like " Please find below our service providers suggestions for your event. If you can't find what you are looking for, please let us know by contacting us on contact@its-invite.com" (make it better). In your answer don't put titles like "1. Event Description:" or "3. Service Provider Suggestions:". Also say that the suggestions are given below. 4. Be synthetic in your answer. 
    `;
  };


  const getChatGPTResponse = async (prompt) => {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`, // Replace with your OpenAI API key
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          // max_tokens: 200,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error?.message)
        throw new Error(errorData.error?.message || "API request failed");
      }
      const data = await response.json();
      return data.choices[0]?.message?.content.trim();
    } catch (error) {
      console.error("Error fetching ChatGPT response:", error);
      return null;
    }
  };

  const getChatgptData = async () => {
    const prompt = generatePrompt();
    const response = await getChatGPTResponse(prompt);
    setDescription(response);
    SetLoading(false);
  }

  useEffect(() => {
    if (formData) {
      SetLoading(true);
      getChatgptData();
    }
  }, [formData])

  const RecapDetail = ({ label, value }) => (
    <div className="rounded-lg">
      <p className="text-[#EB3465] text-[11px] md:text-[12px] lg:text-[13px]">
        {label}
      </p>
      <p className="text-white text-[11px] md:text-[14px] lg:text-[16px] break-words">
        {value}
      </p>
    </div>
  );

  const navigate = useNavigate();
  const mapRef = useRef(null);

  const generatePrompts = (data) => {
    return `
        Generate a JSON object in the following format for a Google Maps API request:
    
        {
          location: center, // Use the latitude and longitude of the city derived from the provided location area
          radius: "25000", // Keep the radius constant
          type: "restaurant", // Set this to the place type based on the event details
          keyword: // Generate the best keywords based on the provided event details
        }
    
        **Inputs:**
        - Event Type: ${data?.event_type || "N/A"} // Example: birthday, graduation, marriage, etc.
        - Number of Attendees: ${data?.people || "N/A"} // Number of people attending
        - Event Vibe (Activity): ${data?.activity?.join(", ") || "N/A"} // Example: bowling, karting, etc.
        - Location: ${data?.area || "N/A"} // Area whose city latitude and longitude you should derive
        - Preferred Food: ${data?.food_eat?.join(", ") || "N/A"} // Example: Chinese, Mexican, etc.
        - Time: ${data?.time || "N/A"} // Example: Morning, Noon, Evening
        **Guidelines:**
        1. Use the area input to determine the city and its corresponding latitude and longitude. If the exact area is not found, use a general location based on the city name.
        2. The keyword field should include relevant terms derived from the following:
          - Event type (e.g., birthday, marriage).
          - Activities (e.g., bowling, karting).
          - Preferred food (e.g., Chinese, Mexican).
          - Time (e.g., Morning, Evening, if it aligns with specific dining times or activities).
        3. Keep the type field as "restaurant" unless the event type or activity strongly suggests another type, like "amusement_park" or "bowling_alley."
        4. Ensure the convert into JSON Parse is properly formatted for direct use with Google Maps API.
    
        **Output format:** Only provide the JSON structure without any explanations, extra text, or comments.
    
        Example Output:
        {
          location: {lat: latitude, lng: longitude}, // Latitude and longitude of the given location
          radius: "25000", // Fixed radius
          type: "restaurant", // Default to restaurant unless strongly implied otherwise
          keyword: "combined keywords" // Combine event type, activities, food preferences, and time into relevant keywords
        }
       
        **Input Data:**
        - Event Type: "${data?.event_type || "N/A"}"
        - Number of Attendees: "${data?.people || "N/A"}"
        - Event Vibe (Activity): "${data?.activity?.join(", ") || "N/A"}"
        - Location: "${data?.area || "N/A"}"
        Place: "${data?.place || "N/A"}"
        - Preferred Food: "${data?.food_eat?.join(", ") || "N/A"}"
        - Time: "${data?.time || "N/A"}"
      `;
  };

  // Function to fetch ChatGPT response
  const getChatGPTResponses = async (prompt) => {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`, // Replace with your OpenAI API key
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 150,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error?.message);

        throw new Error(errorData.error?.message || "API request failed");
      }
      const data = await response.json();
      return data.choices[0]?.message?.content.trim();
    } catch (error) {
      console.error("Error fetching ChatGPT response:", error);
      return null;
    }
  };

  const mapInstance = useRef(null);
  const [placesData, setPlacesData] = useState([]);

  console.log("placesData0" ,placesData)
  useMemo(() => {
    const initMap = async () => {
      if (!window.google || !window.google.maps) {
        console.error("Google Maps API is not available.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setGoogleLoading(true);
          const { latitude, longitude } = position.coords;
          const center = new window.google.maps.LatLng(latitude, longitude);
          mapInstance.current = new window.google.maps.Map(mapRef.current, {
            center,
            zoom: 11,
          });
          const prompt = generatePrompts(formData);
          let refinedSearchTerm = await getChatGPTResponses(prompt);
          refinedSearchTerm = JSON.parse(refinedSearchTerm);
          nearbySearch(refinedSearchTerm);
          try {
            setGoogleLoading(false);
          } catch (error) {
            setGoogleLoading(false);
          }
        },
        (error) => {
          setGoogleLoading(false);
          console.error("Error getting user location:", error);
        }
      );
    };
    initMap();
  }, [formData]);



  const nearbySearch = async (searchTerm) => {
    setGoogleLoading(true);
    // Check if location data is valid
    if (!searchTerm || !searchTerm.location || !searchTerm.location.lat || !searchTerm.location.lng) {
      console.error("Invalid searchTerm structure:", searchTerm);
      setGoogleLoading(false);
      return;
    }
    const main = new Listing();
    try {
      const response = await main.nearbySearch({
        body: JSON.stringify({
          latitude: searchTerm.location.lat,
          longitude: searchTerm.location.lng,
          radius: searchTerm.radius || "80000",
          type: formData?.event_type || searchTerm.type,
          keyword: `${formData?.event_type}, ${searchTerm.keyword}`,
        }),
      });
      console.log("response", response)
      if (response?.data?.status === true) {
        if (response?.data?.data && Array.isArray(response.data.data)) {
          const serializableResults = response.data.data.map((result) => ({
            ...result,
            services_provider_categories: searchTerm.type,
            geometry: {
              location: {
                lat: result.geometry?.location?.lat || 0, // Default to 0 if missing
                lng: result.geometry?.location?.lng || 0, // Default to 0 if missing
              },
            },
          }));
          console.log("serializableResults" ,serializableResults)
          setPlacesData(serializableResults);
          dispatch(addGoogleData(serializableResults));
          setGoogleLoading(false);
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while fetching nearby locations');
    } finally {
      setGoogleLoading(false);
    }
  };



  return (
    <div className="bg-[#000] p-[10px] h-full min-h-full">
      <div ref={mapRef} style={{ width: "100%", height: "400px", display: "none" }}></div>

      <div className="w-[96%] max-w-[1300px] mx-auto mt-[30px] ">
        <button
          onClick={() => {
            dispatch(clearAllVenues());
            dispatch(clearGoogleData());
            dispatch(updateData({ step: 10 }));
            navigate(-1);
          }}
          className="inline-flex items-center rounded-lg p-4 bg-[#1B1B1B] gap-x-2 text-white hover:text-pink-500  focus:outline-none"
        >
          <FaLongArrowAltLeft size={32} />
        </button>
      </div>
      <div className="w-[96%] max-w-[1300px] m-auto mt-[30px] bg-[#1B1B1B] rounded-lg container mx-auto ">
        <h1 className="text-[30px] md:text-[40px] font-[700] px-[10px] md:px-[30px] py-[15px] border-b border-b-[#ffffff21] mb-[2px] lg:mb-[20px] text-white">
          <span className="text-[#EB3465]">Event </span> recap
        </h1>
        {loading ?
          <LoadingSpinner />
          :
          <div className="px-[10px] md:px-[20px] lg:px-[30px] pt-[10px] pb-[20px]">

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-[10px] md:gap-[15px] lg:gap-[20px]">
              <RecapDetail
                label="📅 Date:"
                value={
                  formData?.day && formData?.month && formData?.year
                    ? `${formData.day}-${formData.month}-${formData.year}`
                    : data?.created_at
                      ? moment(data.created_at).format("DD MMM YYYY")
                      : "N/A"
                }
              />
              <RecapDetail
                label="🗺️ Location:"
                value={formData?.area || data?.area || "N/A"}
              />
              <RecapDetail
                label="🥳 Event Type:"
                value={formData?.event_type?.replaceAll("_", " ") || data?.package_name?.replaceAll("_", " ") || "N/A"}
              />
              <RecapDetail
                label="👥 Number of Attendees:"
                value={formData?.people || data?.package_people || "N/A"}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-[10px] md:gap-[15px] lg:gap-[20px] mt-[5px] lg:mt-[10px]">
              <RecapDetail
                label="🍔 Food:"
                value={
                  formData?.food_eat?.join(", ") ||
                  data?.package_categories?.join(", ") ||
                  "N/A"
                }
              />
              <RecapDetail
                label="💵 Budget:"
                value={priceText[formData?.budget] || "N/A"}
              />
              <RecapDetail
                label="🎳 Activity:"
                value={formData?.activity?.join(", ") || "N/A"}
              />
              <RecapDetail
                label="✉️ Email:"
                value={formData?.email || data?.services_provider_email || "N/A"}
              />
            </div>

            <div className="gap-[10px] md:gap-[15px] lg:gap-[20px] mt-[10px]">
              <RecapDetail
                label="⌛ Description:"
                value={description || "N/A"}
              />
            </div>

            <div className="flex justify-center mt-[15px]">
              <a
                href="#services_provider"
                aria-label="Unlock your custom-made event"
                className="flex items-center px-[8px] py-5 bg-[#ff0062] hover:bg-[#4400c3] text-white font-bold rounded text-[11px] md:text-[14px] transition leading-[15px]"
              >
                🔓 Unlock your custom-made event
                <svg
                  width="16"
                  height="15"
                  viewBox="0 0 16 15"
                  fill="none"
                  className="ml-[5px]"
                >
                  <path
                    d="M0 8.88336H11.5861L7.08606 13.3834L8.50006 14.7974L15.4141 7.88336L8.50006 0.969364L7.08606 2.38336L11.5861 6.88336H0V8.88336Z"
                    fill="white"
                  />
                </svg>
              </a>
            </div>
          </div>
        }
      </div>
    </div>
  );
}