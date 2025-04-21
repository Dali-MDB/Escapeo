"use client";

import { useEffect, useState, useRef } from "react";
import { modify, plus } from "../data";
import { getMyProfile, updateMyProfile } from "../../utils/auth";
import { API_URL } from "../../utils/constants";

export default function Account() {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await getMyProfile();
        if (response.success) {
          // Transform the data to match your display fields
          const transformedData = {
            username: response.profile.username,
            email: response.profile.email,
            full_name:
              response.profile.first_name && response.profile.last_name
                ? `${response.profile.first_name} ${response.profile.last_name}`
                : response.profile.username,
            phone_number: response.profile.phone_number,
            address:
              response.profile.city && response.profile.country
                ? `${response.profile.city}, ${response.profile.country}`
                : null,
            date_of_birth: response.profile.birthdate,
            profile_picture: '/JohnDoe.jpg', // Default image
            // Add any other fields you need
          };
          setProfileData(transformedData);
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // ... [keep all your existing handlers like handleProfilePictureChange, triggerFileInput] ...

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        Error: {error}
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex justify-center items-center h-screen">
        No profile data found.
      </div>
    );
  }

  return (
    <div className="w-full py-0 px-2 flex flex-col gap-14">
      {/* Profile picture section (keep your existing code) */}
      <div className="bg-[url('/coverProfile.jpg')] flex justify-end items-end w-full h-56 rounded-2xl z-0 relative">
        <div className="rounded-full w-64 h-64 p-3 mx-auto mb-[-120px] bg-[#EEDAC4] flex justify-center object-contain items-center">
        <div
    className="w-full h-full rounded-full"
    style={{
      backgroundImage: `url('/JohnDoe.jpg')`,
      backgroundPosition: "center",
      backgroundSize: "cover",
    }}
  ></div>
        </div>
      </div>
      {console.log(
        `${API_URL}/media/profile_pictures/${
          profileData.profile_picture || "JohnDoe.jpg"
        }`
      )}
      {/* Username display */}
      <div className="w-full z-10 flex gap-2 flex-col text-center mt-16 text-black">
        <h1 className="text-3xl font-semibold">{profileData.username}</h1>
        <p className="text-md font-medium">{profileData.email}</p>
      </div>

      {/* Profile information */}
      <div className="w-full rounded-2xl bg-[var(--bg-color)] p-4 pb-0">
        {[
          { name: "Name", value: profileData.full_name || "N/A" },
          { name: "Email", value: profileData.email || "N/A" },
          { name: "Phone Number", value: profileData.phone_number || "N/A" },
          { name: "Address", value: profileData.address || "N/A" },
          { name: "Date of Birth", value: profileData.date_of_birth || "N/A" },
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
                {el.name === "Email" && (
                  <button className="w-fit py-2 px-3 flex flex-row justify-center items-center rounded-md border-[1px] gap-2">
                    {plus} Add another email
                  </button>
                )}
                <button className="w-fit py-2 px-3 flex flex-row justify-center items-center rounded-md border-[1px] gap-1">
                  {modify} Change
                </button>
              </div>
            </div>
            {index !== 4 && (
              <hr className="h-1 w-[95%] border-[rgba(0,0,0,0.1)]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
