import { useState, useEffect } from "react";
import { ResponsiveBar } from "@nivo/bar";

export default function MyBarChart2() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const generateVisitData = () => {
    return [
      { country: "America", visits: Math.floor(Math.random() * 700 + 20) },
      { country: "France", visits: Math.floor(Math.random() * 700 + 20) },
      { country: "India", visits: Math.floor(Math.random() * 700 + 20) },
      { country: "U.K", visits: Math.floor(Math.random() * 700 + 20) },
      { country: "Algeria", visits: Math.floor(Math.random() * 700 + 20) },
    ];
  };

  useEffect(() => {
    console.log("Fetching data...");
    setTimeout(() => {
      const newData = generateVisitData();
      setData(newData);
      setIsLoading(false);
      console.log("Data loaded:", newData);
    }, 1500);
  }, []);

  return (
    <div style={{ height: "300px", width: "100%" , textAlign:'left' }}>
      <ResponsiveBar
        data={data}
        keys={["visits"]}
        indexBy="country"
        margin={{ top: 50, right: 20, bottom: 0, left: 60 }}
        padding={0.55}
        innerPadding={10}
        groupMode="grouped"
        layout="horizontal"
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        colors={{ scheme: "purple_blue_green" }}
        defs={[
          {
            id: "dots",
            type: "patternDots",
            background: "inherit",
            color: "#38bcb2",
            size: 4,
            padding: 1,
            stagger: true,
          },
          {
            id: "lines",
            type: "patternLines",
            background: "inherit",
            color: "#4F74EA",
            rotation: -45,
            lineWidth: 10,
            spacing: 10,
          },
        ]}
        fill={[{ match: "*", id: "lines" }]}
        borderRadius={5}
        borderWidth={1}
        borderColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={null}
        axisLeft={{
          tickSize: 0,
          legendPosition: "middle",
          legendOffset: 0,
          truncateTickAt: 0,
          tickPadding:15
        }}
        enableGridY={false}
        labelSkipWidth={12}
        labelSkipHeight={20}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", "0"]],
        }}
        labelPosition="center"
        legends={[]}
        role="application"
        ariaLabel="Nivo bar chart demo"
        barAriaLabel={(e) => `${e.data.country}: ${e.value} visits`}
      />
    </div>
  );
}
