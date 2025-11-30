import React, { useEffect, useRef, useState } from "react";
import { IoStar } from "react-icons/io5";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
import { useDispatch, useSelector } from "react-redux";
import { addVenue, removeVenue } from "../Redux/selectedVenuesSlice";
import productimage from "../../../assets/product.png";
import { updateData } from "../Redux/formSlice";
import Submit from "./Submit";
import LoadingSpinner from "../../compontents/LoadingSpinner";

export default function ServicesProvider({ data, description, googleloading }) {
  const tabs = ["Venue", "Catering", "Activity", "Other"];
  const tabsRef = useRef([]);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("Venue");
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [tabUnderlineWidth, setTabUnderlineWidth] = useState(0);
  const [tabUnderlineLeft, setTabUnderlineLeft] = useState(0);

  useEffect(() => {
    if (activeTabIndex === null) {
      return;
    }

    const setTabPosition = () => {
      const currentTab = tabsRef.current[activeTabIndex];
      setTabUnderlineLeft(currentTab?.offsetLeft || 0);
      setTabUnderlineWidth(currentTab?.clientWidth || 0);
    };

    setTabPosition();
  }, [activeTabIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => {
        const currentIndex = tabs.indexOf(prev);
        const nextIndex = (currentIndex + 1) % tabs.length;
        setActiveTabIndex(nextIndex);
        return tabs[nextIndex];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [tabs]);

  const selectedVenues = useSelector(
    (state) => state.selectedVenues.selectedVenues
  );
  const updatedFormData = useSelector(
    (state) => state.GoogleData.updatedFormData
  );

  const firstItem = updatedFormData[0];
  const priceText = {
    1: "Budget-friendly place",
    2: "Mid-range place with good value",
    3: "Higher-end place",
    4: "Luxury and premium option",
  };

  // const filteredServices = firstItem?.filter(
  //   (service) =>
  //     service.services_provider_categries?.toLowerCase() ===
  //     activeTab.toLowerCase()
  // );

  const handleCheckboxChange = (venue) => {
    const isVenueSelected = selectedVenues.some(
      (selected) => selected.place_id === venue.place_id
    );
    if (isVenueSelected) {
      dispatch(removeVenue(venue.place_id));
    } else {
      dispatch(addVenue(venue));
    }
  };

  // const getPhotoUrls = (photos) => {
  //   if (photos && photos.length > 0) {
  //     return photos.map((photo) => photo.getUrl({ maxWidth: 400 })); // Return array of photo URLs
  //   }
  //   return []; // Return empty array if no photos are available
  // };
  const apikey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const getPhotoUrls = (photos) => {
    if (Array.isArray(photos) && photos.length > 0) {
      return photos
        .map((photo) => {
          if (photo?.photo_reference) {
            return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apikey}`;
          }
          return null; // Skip invalid entries
        })
        .filter(Boolean); // Filter out null or undefined
    }
    return []; // Return an empty array if photos is invalid or empty
  };

  return (
    <>
      <div className="w-[96%] max-w-[1230px] mx-auto mt-[60px] md:mt-[60px] lg:mt-[40px]">
        <h2
          id="services_provider"
          className="mb-[30px] px-[15px] font-manrope font-[700] text-[25px] leading-[30px] sm:text-[30px] sm:leading-[30px] md:text-[38px] md:leading-[40px] lg:text-[48px] lg:leading-[60px] text-white text-center"
        >
          Select your service providers
        </h2>
        <div className="relative mx-auto flex flex-col items-center">
          <div className="flex-row w-[96%] mb-[40px] max-w-[520px] relative mx-auto flex h-[44px] md:h-[62px] lg:h-[63px] border border-black/40 bg-neutral-800 px-1 backdrop-blur-sm rounded-[60px]">
            <span
              className="absolute bottom-0 top-0 -z-10 flex overflow-hidden rounded-[60px] py-1 transition-all duration-300"
              style={{ left: tabUnderlineLeft, width: tabUnderlineWidth }}
            >
              <span className="h-full w-full rounded-3xl bg-[#4400c3] border-[#4400c3]" />
            </span>
            {tabs && tabs?.map((tab, index) => {
              const isActive = activeTabIndex === index;

              return (
                <button
                  key={index}
                  ref={(el) => (tabsRef.current[index] = el)}
                  className={`${isActive
                    ? "text-[#ffff]"
                    : "text-[#ffffff8f] hover:text-white"
                    } flex-1 capitalize px-[5px] sm:px-[12px] md:px-[15px] text-[14px] md:text-[15px] lg:text-lg font-semibold rounded-[60px]`}
                  onClick={() => {
                    setActiveTabIndex(index);
                    setActiveTab(tab);
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        <>
          {googleloading ? (
            <LoadingSpinner />
          ) : (
            <>
              {firstItem && firstItem.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {firstItem?.map((venue, index) => (
                      <div
                        className={`bg-[#1B1B1B] shadow-md rounded-lg m-2 flex flex-col ${selectedVenues.some(
                          (selected) => selected.place_id === venue.place_id
                        )
                          ? "border-2 border-[#D7F23F]"
                          : "border-2 border-transparent"
                          }`}
                        key={index}
                      >
                        {/* Venue Card Content */}
                        <div className="relative">
                          {/* Checkbox */}
                          <div className="absolute left-[15px] top-[15px] zindex">
                            <div className="form-checkbx">
                              <input
                                type="checkbox"
                                id={`estimate-${index}`}
                                checked={selectedVenues.some(
                                  (selected) => selected.place_id === venue.place_id
                                )}
                                onChange={() => handleCheckboxChange(venue)}
                              />
                              <label htmlFor={`estimate-${index}`}></label>
                            </div>
                          </div>

                          <div className="absolute right-[8px] top-[8px] z-[50] flex items-center gap-[10px] h-[38px] text-white bg-[#000] rounded-[60px] px-[15px] py-[2px] text-[14px] leading-[15px]">
                            <IoStar size={17} className="text-[#FCD53F]" />
                            {venue.rating}
                          </div>

                          {/* Price Level */}
                          {venue?.price_level && (
                            <div className="estimated-div-color items-end flex justify-between absolute bottom-0 w-full text-white z-10 px-[15px] py-2 text-[15px] md:text-[16px] xl:text-[18px]">
                              <span className="text-[#EB3465] text-[12px]">
                                Estimated Budget
                              </span>
                              {priceText[venue?.price_level] || "N/A"}
                            </div>
                          )}

                          {/* Swiper */}
                          <div className="mk relative">
                            <Swiper
                              cssMode={true}
                              navigation={false}
                              pagination={{
                                clickable: true, // Enable pagination dots
                              }}
                              mousewheel={true}
                              keyboard={true}
                              autoplay={{ delay: 3000, disableOnInteraction: false }}
                              modules={[Pagination, Autoplay]}
                              className="mySwiper relative"
                            >
                              {venue.photos ? (
                                getPhotoUrls(venue.photos)?.map((url, imgIndex) => (
                                  <SwiperSlide key={imgIndex}>
                                    <img
                                      src={url ? url : productimage}
                                      alt={venue.name}
                                      className="h-[300px] w-full object-cover rounded-t-lg"
                                    />
                                  </SwiperSlide>
                                ))
                              ) : (
                                <img
                                  src={productimage}
                                  alt="event"
                                  className="h-[300px] w-full object-cover"
                                />
                              )}
                            </Swiper>
                          </div>
                        </div>

                        {/* Venue Details */}
                        <div
                          className="p-[15px]"
                          onClick={() => handleCheckboxChange(venue)}
                        >
                          <h2 className="mt-[15px] mb-[15px] text-[18px] capitalize font-semibold text-white">
                            {venue.name}
                          </h2>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Booking Button */}
                  <div className="flex flex-col justify-center items-center mt-[30px]">
                    <Link
                      to={selectedVenues.length > 0 ? `/payment-book` : "#"}
                      className={`mt-4 px-[50px] py-[17px] font-[500] text-[18px] rounded transition duration-300 bg-[#ff0062] text-white hover:bg-[#4400c3] ${selectedVenues.length > 0
                        ? "cursor-pointer"
                        : "cursor-not-allowed"
                        }`}
                      onClick={(e) => {
                        dispatch(updateData({ summary: description }));
                        if (selectedVenues.length <= 0) e.preventDefault();
                      }}
                    >
                      Book Now
                    </Link>
                    <Submit steps={1} />
                  </div>
                </>
              ) : (
                <Submit steps={2} />
              )}
            </>
          )}
        </>

      </div>
    </>
  );
}
