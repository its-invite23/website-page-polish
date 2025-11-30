import React, { useEffect, useState } from 'react'
import UserLayout from "../../Layout/UserLayout"
import ServicesProvider from './ServicesProvider'
import Servicesrecap from './Servicesrecap'
import { useParams } from 'react-router-dom'
import Listing from '../../../Api/Listing'
import { useSelector } from 'react-redux'
import ServicesProviderPackage from './ServiceProviderPackage'

const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,geocoding`;
  document.body.appendChild(script);
export default function Services() {
  const updatedFormData = useSelector((state) => state.form.updatedFormData);
  const { id } = useParams()
  const [data, setData] = useState("");
  const [description, setDescription] = useState();
  const [loading, SetLoading] = useState(false);
  const fetchApi = async () => {
    try {
      const main = new Listing();
      SetLoading(true);
      const response = await main.getServices({ Id: id });
      setData(response?.data?.data)
      SetLoading(false);
    } catch (error) {
      SetLoading(false);
      console.log("error", error);
    }
  };


  useEffect(() => {
    if (id) {
      fetchApi(id);
    }
  }, [id]);

  const [googleloading, setGoogleLoading] = useState(false);


  return (
    <div className="bg-[#000] p-[10px] h-full min-h-full">
      <UserLayout>
        {id ?
          <>
            {/* Package waala flow */}
            <ServicesProviderPackage id={id} data={data} loading={loading} />
          </>
          :
          <>
            {/* Google Map waala flow */}
            <Servicesrecap data={data} formData={updatedFormData} id={id} description={description} setDescription={setDescription}  setGoogleLoading={setGoogleLoading} />
            <ServicesProvider data={data} description={description} googleloading={googleloading} />
          </>
        }
      </UserLayout>
    </div>
  )
}
