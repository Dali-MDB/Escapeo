"use client";

import { ResponsiveChoropleth } from "@nivo/geo";
import { useState, useEffect } from "react";
import { TravelData as travelData } from "../../data";

const MyGeoChart = () => {
    const [features, setFeatures] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log("Fetching GeoJSON data...");
        fetch("/data/world_countries.json") // Load from the public folder
            .then((response) => response.json())
            .then((geoData) => {
                setFeatures(geoData.features); // Extract 'features' array
                setIsLoading(false);
            })
            .catch((error) => console.error("Error loading GeoJSON:", error));
    }, []);

    return (
        <div style={{ height: "400px", width: "100%" }}>
            {isLoading ? (
                <p style={{ textAlign: "center", fontSize: "18px" }}>Loading map...</p>
            ) : (
                <ResponsiveChoropleth
                    data={travelData}
                    features={features}
                    margin={{ top: 5, right: 0, bottom: 5, left: 0 }}
                    colors="PuBu"
                    domain={[0, 600000]}
                    unknownColor="#666666"
                    label="properties.name"
                    valueFormat=".1s"
                    projectionTranslation={[0.49, 0.7]}
                    projectionRotation={[0, 0, 0]}
                    enableGraticule={false}
                    graticuleLineColor="#dddddd"
                    borderWidth={0.5}
                    borderColor="#152538"
                />
            )}
        </div>
    );
};

export default MyGeoChart;
