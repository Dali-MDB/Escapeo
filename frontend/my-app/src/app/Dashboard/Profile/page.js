 "use client";
 
 import { useEffect, useState, useRef } from "react";
 import {  plus } from "../data";
 import { getMyProfile, updateMyProfile } from "../../utils/auth";
 import { API_URL } from "../../utils/constants";
 import Image from "next/image";
 import { toast } from "react-toastify";
 import { useRouter } from 'next/navigation';
 import { Edit } from "lucide-react";
 export default function Account() {
   const [profileData, setProfileData] = useState(null);
   const [formData, setFormData] = useState({
   username:"",
     first_name: '',
     last_name: '',
     phone_number: '',
     city: '',
     country: '',
     birthdate: ''
   });
   const [imageVersion, setImageVersion] = useState(0);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState(null);
   const [isUploading, setIsUploading] = useState(false);
   const [isEditing, setIsEditing] = useState(false);
   const fileInputRef = useRef(null);
   const router = useRouter();
 
   useEffect(() => {
     fetchProfile();
   }, []);
 
   const fetchProfile = async () => {
     try {
       const response = await getMyProfile();
       if (response.success) {
         setProfileData(response.profile);
         setFormData({
          usser: response.profile.user,
           first_name: response.profile.first_name || '',
           last_name: response.profile.last_name || '',
           city: response.profile.city || '',
           country: response.profile.country || '',
           birthdate: response.profile.birthdate || '',
           department:  response.profile.department || '',
           join_date: response.profile.join_date || '',
         });
       } else {
         setError(response.error || 'Failed to fetch profile');
       }
     } catch (err) {
       setError(err.message || 'An error occurred');
     } finally {
       setIsLoading(false);
     }
   };
 
   const handleProfilePictureChange = async (e) => {
     const file = e.target.files[0];
     if (!file) return;
 
     const formData = new FormData();
     formData.append('profile_picture', file);
 
     try {
       setIsUploading(true);
       const response = await fetch(`${API_URL}/profiles/update_profile_picture/`, {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
         },
         body: formData,
       });
 
       if (response.ok) {
         const data = await response.json();
         setProfileData(prev => ({
           ...prev,
           profile_picture: data.profile_picture,
           _timestamp: Date.now()
         }));
         setImageVersion(v => v + 1);
         toast.success('Profile picture updated successfully');
       } else {
         throw new Error('Failed to update profile picture');
       }
     } catch (err) {
       toast.error(err.message);
     } finally {
       setIsUploading(false);
       router.refresh();
     }
   };
 
   const triggerFileInput = () => {
     fileInputRef.current.click();
   };
 
   const handleInputChange = (e) => {
     const { name, value } = e.target;
     setFormData(prev => ({
       ...prev,
       [name]: value
     }));
   };
 
   const handleSubmit = async (e) => {
     e.preventDefault();
     try {
       // Prepare the data in the correct format for your backend
       const submissionData = {
         ...formData,
         // Include any other fields your backend expects
       };
 
       const response = await updateMyProfile(submissionData);
       if (response.success) {
         setProfileData(prev => ({
           ...prev,
           ...formData,
         }));
         toast.success('Profile updated successfully');
         setIsEditing(false);
       } else {
         throw new Error(response.error || 'Failed to update profile');
       }
     } catch (err) {
       toast.error(err.message);
     }
   };
 
   // ... [loading and error states remain the same] ...
 
   const defaultProfilePic = "/media/profile_pictures/profile.png";
   const profilePictureUrl = profileData?.profile_picture
     ? `${API_URL}${profileData.profile_picture}?v=${imageVersion}`
     : `${API_URL}${defaultProfilePic}?v=${imageVersion}`;
 
   return (
     <div className="w-full py-0 px-2 flex flex-col gap-8">
       {/* Profile picture section */}
       <div className="bg-[url('/coverProfile.jpg')] flex justify-end items-end w-full h-56 rounded-2xl z-0 relative">
         <div className="rounded-full overflow-hidden w-64 h-64 p-3 mx-auto mb-[-120px] bg-[#EEDAC4] flex justify-center object-contain items-center">
           <div className="w-full h-full rounded-full relative overflow-hidden">
             <div className="relative w-full overflow-hidden rounded-full flex justify-center items-center">
               <Image
                 width={400}
                 height={400}
                 alt="Profile picture"
                 src={profilePictureUrl}
                 className="object-cover w-full h-full"
                 key={`profile-img-${imageVersion}`}
               />
             </div>
           </div>
           <button
             onClick={triggerFileInput}
             className="absolute bottom-[-120px] right-[600px] z-50 bg-white p-2 rounded-xl shadow-md"
           >
             {<Edit size={15} />}
           </button>
           <input
             type="file"
             ref={fileInputRef}
             onChange={handleProfilePictureChange}
             accept="image/*"
             className="hidden"
           />
         </div>
       </div>
        {/* Username display */}
      <div className="w-full mt-24 z-10 flex gap-2 flex-col text-center  text-black">
         <h1 className="text-3xl font-semibold">{profileData?.user?.username}</h1>
         <p className="text-md font-medium">{profileData?.user?.email}</p>
       </div>
 
       {/* Profile information */}
       <div className="w-full rounded-2xl bg-[var(--bg-color)] px-4 pt-6 pb-4">
         {isEditing ? (
           <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div className="rounded-xl flex flex-col gap-2">
                 <label className="block text-lg text-[var(--primary)] font-medium ">First Name</label>
                 <input
                   name="first_name"
                   value={formData.first_name}
                   onChange={handleInputChange}
                   className="w-full p-2 border rounded"
                 />
               </div>
               <div className="rounded-xl flex flex-col gap-2">
                 <label className="block text-lg text-[var(--primary)] font-medium ">Last Name</label>
                 <input
                   name="last_name"
                   value={formData.last_name}
                   onChange={handleInputChange}
                   className="w-full p-2 border rounded"
                 />
               </div>
             </div>
 
 
 
             <div className="grid grid-cols-2 gap-4">
               <div className="rounded-xl flex flex-col gap-2">
                 <label className="block text-lg text-[var(--primary)] font-medium ">City</label>
                 <input
                   name="city"
                   value={formData.city}
                   onChange={handleInputChange}
                   className="w-full p-2 border rounded"
                 />
               </div>
               <div className="rounded-xl flex flex-col gap-2">
                 <label className="block text-lg text-[var(--primary)] font-medium ">Country</label>
                 <input
                   name="country"
                   value={formData.country}
                   onChange={handleInputChange}
                   className="w-full p-2 border rounded"
                 />
               </div>
               <div className="rounded-xl flex flex-col gap-2">
                 <label className="block text-lg text-[var(--primary)] font-medium ">First Name</label>
                 <input
                   name="department"
                   value={formData.department}
                   onChange={handleInputChange}
                   className="w-full p-2 border rounded"
                 />
               </div>
               <div className="rounded-xl flex flex-col gap-2">
               <label className="block text-lg text-[var(--primary)] font-medium ">Date of Birth</label>
               <input
                 type="date"
                 name="birthdate"
                 value={formData.birthdate}
                 onChange={handleInputChange}
                 className="w-full p-2 border rounded-xl"
               />
             </div>

             </div>
 
             
             <div className="flex justify-end gap-2 pt-4">
               <button
                 type="button"
                 onClick={() => setIsEditing(false)}
                 className="px-4 py-2 rounded"
               >
                 Cancel
               </button>
               <button
                 type="submit"
                 className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--bg-color)] rounded-xl"
                 >
                 Save
               </button>
             </div>
           </form>
         ) : (
           <div className="">
             {[
               {
                 name: "Name",
                 value: profileData?.first_name || profileData?.last_name
                   ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim()
                   : "N/A"
               },
               { name: "Join Date", value: profileData?.join_date || "N/A" },
 
               {
                 name: "Address",
                 value: profileData?.city || profileData?.country
                   ? `${profileData.city || ''}, ${profileData.country || ''}`.trim()
                   : "N/A"
               },
               { name: "Date of Birth", value: profileData?.birthdate || "N/A" },
             ].map((el, index) => (
               <div
                 key={index}
                 className="w-full h-full flex flex-col justify-between items-center text-left"
               >
                 <div className="w-full px-4 py-4 h-full flex flex-row justify-between items-center text-left">
                   <div className="w-full h-full flex flex-col justify-center gap-1 items-center">
                     <p className="w-full text-md font-extralight text-[var(--primary)]">{el.name}</p>
                     <h1 className="w-full text-xl">{el.value}</h1>
                   </div>
                   <button
                     onClick={() => setIsEditing(true)}
                     className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--bg-color)] rounded-xl"
                   >
                     {<Edit size={15} />} Edit 
                   </button>
 
                 </div>
                 {index !== 3 && (
                   <hr className="h-1 w-[95%] border-[rgba(0,0,0,0.1)]" />
                 )}
               </div>
             ))}
             
           </div>
         )}
       </div>
     </div>
   );
 }
