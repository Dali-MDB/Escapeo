"use client";
import { modify, plus } from "@/app/Setting/data";
import { getMyProfile } from "@/app/utils/auth";
import { API_URL } from "@/app/utils/constants";
import { useEffect, useState } from "react";
import { FaFacebook, FaLinkedinIn, FaGithub, FaTwitter, FaSlack } from "react-icons/fa";


export default function Profile() {


  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {

    const getProfile = async () => {

      setLoading(true);
      const response = await getMyProfile();
      console.log(response);

      const profile = response.profile;


      setProfile(profile);
      setLoading(false);


    }
    getProfile();
  }, [])


  return (
    <div className="w-full py-0 px-2 flex flex-col ">



      {

        loading ? (
          <div className="w-full h-screen flex justify-center items-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[#efefef]">
            </div>
          </div>
        ) :
          <>
            <div
              className="bg-[url('/coverProfile.jpg')] flex justify-end items-end w-full h-80 rounded-t-2xl z-0"
              style={{ backgroundPosition: "center", backgroundSize: "cover" }}
            >
              <div className="rounded-full w-64 h-64 p-1 mx-auto mb-[-120px] bg-[#EEDAC4] flex justify-center object-contain items-center">
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    backgroundImage: `url('${profile.profile_picture.replace("media/","media/profile_pictures/")}')`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }}
                ></div>
              </div>
            </div>

            <div className="w-full rounded-b-2xl bg-[var(--bg-color)] p-4 pt-32 pb-5">
              <div className=" w-full text-center py-5 gap-8 flex flex-col justify-start items-center">
                <div className="personal-info w-full gap-5 flex flex-col justify-center items-center text-center">

                  <h1 className="text-5xl font-bold w-fit">{profile.username}</h1>
                  <p className="w-fit text-lg ">{profile.department}</p>
                </div>

                
                <div className="w-1/2 my-2 rounded-full shadow-md border-[1px] px-10  py-3 flex flex-row justify-evenly items-center ">
                  <span className="w-full text-black text-lg border-r-[0.5px]" >Since
                    <span className="text-[#FF6F61] font-semibold block"> {profile.join_date}</span>
                  </span>
                  <span className="w-full text-black text-lg "><span className="text-[#ff6f61] font-bold">{profile.years_of_experience} </span>years of experience</span>

                </div>

                
                <div className="about py-8 gap-5 w-3/4 flex flex-col rounded-xl border-[0.5px] shadow-md justify-center items-center text-center">

                  <h1 className="text-2xl font-semibold w-fit">Personal info</h1>
                  <div className="w-full rounded-2xl bg-[var(--bg-color)] p-4 pb-0">
                    {[
                      { name: "Name", value: profile.first_name + " " + profile.last_name || "N/A" },
                      { name: "Email", value: profile.email || "N/A" },
                      { name: "Phone Number", value: profile.phone_number || "N/A" },
                      { name: "Address", value: profile.city + ". " + profile.country || "N/A" },
                    ].map((el, index) => (
                      <div
                        key={index}
                        className="w-full h-full flex flex-col justify-between items-center text-left"
                      >
                        <div className="w-full px-4 py-4 h-full flex flex-row justify-between items-center text-left">
                          <div className="w-full h-full flex flex-col justify-center gap-1 items-center">
                            <p className="w-full text-xs font-extralight">{el.name}</p>
                            <h1 className="w-full text-xl">{el.value}</h1>
                          </div>
                          <div className="w-full h-full flex justify-end gap-2 flex-row items-center">
                            <button className="w-fit py-2 px-3 flex flex-row justify-center items-center rounded-md border-[1px] gap-1">
                              {modify} Change
                            </button>
                          </div>
                        </div>
                        {index !== 3 && (
                          <hr className="h-1 w-[95%] border-[rgba(0,0,0,0.1)]" />
                        )}
                      </div>
                    ))}
                  </div> <h1 className="text-xl font-medium w-fit">Follow me </h1>
                  <div className="w-1/2 flex items-center justify-center gap-4 text-2xl">
                    <FaFacebook />
                    <FaGithub />
                    <FaLinkedinIn />
                    <FaTwitter />
                    <FaSlack />
                  </div>
                </div>

                <div className="follow-me px-32 gap-4  w-full flex flex-col justify-center text-gray-600 items-center text-center">

                 

                </div>


              </div>
            </div>
          </>
      }
    </div>
  );
}
