"use client";
import { useState } from "react";
import { DollarSign, Hotel, Search, Star } from "lucide-react";
import InputLogin from "../Dashboard/Components/InputLogin";
import CustomDropdown from "../Dashboard/Components/DropDown";

const HotelSearch = ({ onSearch }) => {
    const [searchParams, setSearchParams] = useState({
        location: "",
        min_stars: "",
        max_stars: "",
        min_price: "",
        max_price: "",
        sort: "recommended",
        ascending: "true"
    });

    const sortOptions = [
        { value: "recommended", label: "Recommended" },
        { value: "price", label: "Price" },
        { value: "stars_rating", label: "Star Rating" }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = () => {
        // Clean up empty params
        const params = Object.fromEntries(
            Object.entries(searchParams).filter(([_, v]) => v !== "")
        );
        onSearch(params);
    };

    return (
        <div className="cursor-pointer text-center shadow-[10px_10px_35px_0_#a4b5c4] z-2 mt-[-15%] py-10 flex flex-col justify-between gap-5 items-start w-full text-lg text-[var(--primary)] px-10 pb-10 bg-[var(--bg-color)] rounded-2xl">
            <div className="flex flex-row justify-evenly gap-5 items-center w-full">
                {/* Location Field */}

                <div className="w-full flex gap-2 flex-col justify-center items-start p-2">

                    <h1 className="flex items-center  text-xl">{
                        <Hotel size={20} className="mr-2" />

                    }Hotel Location</h1>

                    <div className="flex gap-5 py-3 flex-row items-center justify-between w-full">
                        <InputLogin
                            type="text"
                            name="location"
                            value={searchParams.location}
                            onChange={handleInputChange}
                            placeholder="Enter location"
                        />

                    </div>
                </div>
                {/* Star Rating Filter */}
                <div className="w-full flex gap-2 flex-col justify-center items-start p-2">
                    <h1 className="flex items-center text-xl">{<Star size={20} className="mr-2" />}Stars Rating</h1>
                    <div className="flex gap-2 py-3 flex-row items-center justify-between w-full">

                        <InputLogin
                            type="number"
                            name="min_stars"
                            value={searchParams.min_stars}
                            onChange={handleInputChange}
                            placeholder="Min"
                            min="1"
                            max="5"
                            className="w-1/2"
                        />
                        <span>-</span>
                        <InputLogin
                            type="number"
                            name="max_stars"
                            value={searchParams.max_stars}
                            onChange={handleInputChange}
                            placeholder="Max"
                            min="1"
                            max="5"
                            className="w-1/2"
                        />
                    </div>
                </div>

                {/* Price Filter */}
                <div className="w-full flex gap-2 flex-col justify-center items-start p-2">

                    <h1 className="flex items-center  text-xl">{<DollarSign size={20} className="mr-2" />
                    }Price Range</h1>

                    <div className="flex gap-2 py-3 flex-row items-center justify-between w-full">

                        <InputLogin
                            type="number"
                            name="min_price"
                            value={searchParams.min_price}
                            onChange={handleInputChange}
                            placeholder="Min"
                            min="0"
                            className="w-1/2"
                        />
                        <span>-</span>
                        <InputLogin
                            type="number"
                            name="max_price"
                            value={searchParams.max_price}
                            onChange={handleInputChange}
                            placeholder="Max"
                            min="0"
                            className="w-1/2"
                        />
                    </div>
                </div>


                {/* Sort Dropdown */}



                <div
                    className="w-28 bg-[#F38B1E] h-full p-3 rounded-xl cursor-pointer flex items-center justify-center"
                    onClick={handleSearch}
                >
                    <Search size={30} />
                </div>
            </div>
        </div>
    );
};

export default HotelSearch;