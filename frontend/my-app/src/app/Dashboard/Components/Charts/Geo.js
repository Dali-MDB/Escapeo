"use client"

import { ComposableMap, Geographies, Geography } from "react-simple-maps"


export default function Geo() {
    const geoUrl =
    "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json"
    return (
    <ComposableMap>
      <Geographies geography={geoUrl} path="simpl-path">
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography key={geo.rsmKey} geography={geo} />
          ))
        }
      </Geographies>
    </ComposableMap>
  )
}