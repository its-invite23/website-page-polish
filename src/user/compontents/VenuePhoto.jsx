import React from "react";
import ViewImage from "../../assets/product.png";
// Ensure correct path to default image

const VenuePhotos = ({ venue }) => {
  const apikey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Function to get photo URLs from Google Places API
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

  const photos = venue?.placeDetails?.photos || [];
  const photoUrls = getPhotoUrls(photos);

  return (
    <div className="flex items-center flex-wrap md:flex-nowrap gap-[10px] md:gap-[20px] w-full sm:max-w-[300px]   md:max-w-[400px]">
      <div className="w-full min-w-[80px] max-w-[110px]">
        {venue?.services_provider_name ? (
          <img
            src={
              venue?.services_provider_image
                ? venue.services_provider_image
                : ViewImage
            }
            alt="img"
            className="border-none rounded-[4px]"
          />
        ) : (
          <img
            src={photoUrls[0]}
            alt="img"
            className="border-none rounded-[4px]"
          />
        )}
      </div>
      <div className="w-full max-w-[180px] md:max-w-[260px] lg:max-w-[260px] xl:max-w-[380px]">
        <h2 className="font-manrope font-[300] text-[14px] text-[#E69536] uppercase">
          {venue?.package_categories?.join(",")}
        </h2>
        <h3 className="font-manrope text-[#fff] font-[700] text-[16px] leading-[22px] md:text-[16px] md:leading-[23px] lg:text-[18px] lg:leading-[22px] xl:text-[20px] xl:leading-[26px] text-[#fff]">
          {venue?.services_provider_name
            ? venue?.services_provider_name
            : venue?.name}
        </h3>
      </div>
    </div>
  );
};

export default VenuePhotos;
