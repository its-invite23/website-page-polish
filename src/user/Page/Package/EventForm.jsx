import React, { useEffect, useRef, useState } from 'react';
import Listing from '../../../Api/Listing';
import toast from 'react-hot-toast';

export default function EventForm() {
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState({
        name: '',
        email: '',
        message: '',
        eventname: '',
        event_type: '',
        attendees: '',
        phone_code: '',
        phone_number: ''
    });

    const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,idd")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("Unexpected API response format");
        }
  
        const countryPhoneCodes = data.map((country) => {
          const name = country.name?.common || "Unknown";
          const root = country.idd?.root || "";
          const suffixes = country.idd?.suffixes || [""];
          const phoneCodes = suffixes.map((suffix) => `${root}${suffix}`);
          return { name, phoneCodes };
        });
  
        setCountries(countryPhoneCodes);
      })
      .catch((error) => console.error("Error fetching countries:", error));
  }, []);

    const handleInputs = (e) => {
        const { name, value } = e.target;
        setData((prevState) => ({ ...prevState, [name]: value }));
    };

    const handlePhoneCodeChange = (e) => {
        setData((prevState) => ({ ...prevState, phone_code: e.target.value }));
    };

    async function handleForms(e) {
        e.preventDefault();
        if (loading) {
            return false;
        }
        setLoading(true);
        const main = new Listing();
        try {
            const response = await main.Enquiry(data);
            if (response?.data?.status === true) {
                toast.success(response.data.message);
                setData({
                    name: '',
                    email: '',
                    message: '',
                    eventname: '',
                    event_type: '',
                    attendees: '',
                    phone_code: '',
                    phone_number: ''
                });
            } else {
                toast.error(response.data.message);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Invalid Email/password');
            setLoading(false);
        }
    }


    const googlemap = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const inputRef = useRef(null);
    const autocompleteRef = useRef(null);

    useEffect(() => {
        // Load the Google Maps script dynamically
        const loadScript = () => {
            if (!window.google) {
                const script = document.createElement("script");
                script.src = `https://maps.googleapis.com/maps/api/js?key=${googlemap}&libraries=places`;
                script.async = true;
                script.onload = initializeAutocomplete;
                document.body.appendChild(script);
            } else {
                initializeAutocomplete();
            }
        };

        // Initialize the autocomplete feature
        const initializeAutocomplete = () => {
            if (inputRef.current) {
                autocompleteRef.current = new window.google.maps.places.Autocomplete(
                    inputRef.current
                );

                // Add listener for place selection
                autocompleteRef.current.addListener("place_changed", handlePlaceSelect);
            }
        };

        // Handle place selection
        const handlePlaceSelect = () => {
            const place = autocompleteRef.current.getPlace();
            setData((prevData) => ({
                ...prevData,
                eventname: place.formatted_address,
            }));
        };

        loadScript();
    }, [googlemap]);

    return (
        <div className="max-w-[1230px] mx-auto mt-[65px]">
            <h2 className="max-w-[990px] mx-auto font-manpore font-[600] text-white text-center text-[20px] md:text-[23px] lg:text-[25px] xl:text-[33px] leading-[22px] md:leading-[30px] lg:leading-[40px] mb-[8px] md:mb-[20px] lg:px-[50px] xl:px-[60px]">
                Can’t find what you're looking for? Just let us know what you need for your event.
            </h2>
            <form onSubmit={handleForms} className="login-form w-full max-w-[1180px] bg-[#1B1B1B] mt-[40px] rounded-[10px] lg:rounded-[20px] m-auto px-[20px] md:px-[50px] py-[20px] md:py-[50px]">
                <div className="">
                    <div className="w-full grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        <div className="mb-5">
                            <label htmlFor="" className="block w-full font-manrope font-[400] text-white text-[18px] mb-[10px]">User Name</label>
                            <input
                                type="text"
                                autocomplete="off"
                                name="name"
                                onChange={handleInputs}
                                value={data.name}
                                required
                                placeholder="Enter your username"
                                className="placeholder:text-[#998e8e] bg-[#1B1B1B] border border-[#ffffff14] w-full px-[15px] py-[15px] rounded-lg text-base text-white hover:outline-none focus:outline-none"
                            />
                        </div>

                        <div className=" mb-5">
                            <label htmlFor="" className="block w-full font-manrope font-[400] text-white text-[18px] mb-[10px]">Email</label>
                            <input
                                type="email"
                                autocomplete="off"
                                name="email"
                                onChange={handleInputs}
                                required
                                value={data.email}
                                placeholder="Enter your email"
                                className="placeholder:text-[#998e8e] bg-[#1B1B1B] border border-[#ffffff14] w-full px-[15px] py-[15px] rounded-lg text-base text-white hover:outline-none focus:outline-none"
                            />
                        </div>

                    </div>
                    <div className="w-full grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        <div className="mb-5">
                            <label htmlFor="" className="block w-full font-manrope font-[400] text-white text-[18px] mb-[10px]">Phone Code</label>
                            <select
                                onChange={handlePhoneCodeChange}
                                value={data.phone_code}
                                autocomplete="off"
                                 className="drowpdown_icon border border-[#ffffff14] w-full px-[15px] py-[15px] rounded-lg text-base text-white hover:outline-none focus:outline-none"
                            >
                                <option value="">Select a country Code</option>
                                {countries.sort((a, b) => a.name.localeCompare(b.name)).map((country, index) => (
                                    <option key={index} value={country.phoneCodes[0]}>
                                        {country?.name}  ({country.phoneCodes[0]} )
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className=" mb-5">
                            <label htmlFor="" className="block w-full font-manrope font-[400] text-white text-[18px] mb-[10px]">Phone Number</label>
                            <input
                                type="tel"
                                name="phone_number"
                                onChange={(e) => {
                                    if (
                                        e.target.value.length <= 10 &&
                                        /^[0-9]*$/.test(e.target.value)
                                    ) {
                                        handleInputs(e);
                                    }
                                }}
                                pattern="\d{10}"
                                maxlength="10"
                                minlength="10"
                                required
                                value={data.phone_number}
                                placeholder="Enter your Phone Number"
                                className="placeholder:text-[#998e8e]  bg-[#1B1B1B] border border-[#ffffff14] w-full px-[15px] py-[15px] rounded-lg text-base text-white hover:outline-none focus:outline-none"
                            />
                        </div>

                    </div>
                    {/* Additional Fields */}

                    <div className="w-full grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

                        <div className="mb-5">
                            <label htmlFor="" className="block w-full font-manrope font-[400] text-white text-[18px] mb-[10px]">Event Type</label>
                            <input
                                type="text"
                                autocomplete="off"
                                name="event_type"
                                onChange={handleInputs}
                                required
                                value={data.event_type}
                                placeholder="Enter your event type"
                                className="placeholder:text-[#998e8e] bg-[#1B1B1B] border border-[#ffffff14] w-full px-[15px] py-[15px] rounded-lg text-base text-white hover:outline-none focus:outline-none"
                            />
                        </div>

                        <div className="mb-5">
                            <label htmlFor="" className="block w-full font-manrope font-[400] text-white text-[18px] mb-[10px]">Attendees</label>
                            <input
                                type="number"
                                autocomplete="off"
                                name="attendees"
                                onChange={handleInputs}
                                required
                                value={data.attendees}
                                placeholder="Enter the number of attendees"
                                className="placeholder:text-[#998e8e] bg-[#1B1B1B] border border-[#ffffff14] w-full px-[15px] py-[15px] rounded-lg text-base text-white hover:outline-none focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="w-full grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
                        <div className="mb-5">
                            <label htmlFor="" className="block w-full font-manrope font-[400] text-white text-[18px] mb-[10px]">Event Location</label>
                            <input
                                ref={inputRef}
                                type="text"
                                name="eventname"
                                value={data.eventname}
                                onChange={handleInputs}
                                placeholder="Enter a location"
                                className="placeholder:text-[#998e8e]  bg-[#1B1B1B] border border-[#ffffff14] w-full px-[15px] py-[15px] rounded-lg text-base text-white hover:outline-none focus:outline-none"
                            />
                        </div>
                    </div>
                    {/* Message Section */}
                    <div className="w-full">
                        <label htmlFor="" className="block w-full font-manrope font-[400] text-white text-[18px] mb-[10px]">Message</label>
                        <textarea
                            name="message"
                            autocomplete="off"
                            onChange={handleInputs}
                            required
                            value={data.message}
                            placeholder="Write your message"
                            className="placeholder:text-[#998e8e] bg-[#1B1B1B] border border-[#ffffff14] w-full px-[15px] py-[15px] rounded-lg text-base text-white hover:outline-none focus:outline-none"
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center mt-[20px]">
                        <button
                            type="submit"
                            className="bg-[#ff0062] hover:bg-[#4400c3] text-white px-[20px] py-[15px] rounded-[5px] font-bold text-[18px] w-full md:w-[30%]"
                        >
                            {loading ? 'Sending...' : 'Submit'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
