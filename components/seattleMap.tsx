"use client";

import { useEffect, useState, useMemo } from "react";
import React from "react";
import type { LatLngExpression } from "leaflet";
import { blockfaces } from "@/constants/blockfaces";
import "leaflet/dist/leaflet.css";

interface SeattleMapProps {
  handleChange: (blockface: string, studyArea: string) => void;
  center?: LatLngExpression;
  zoom?: number;
}

export default function SeattleMap({
  handleChange,
  center,
  zoom = 13,
}: SeattleMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Convert State Plane Washington North to Lat/Lng
  const convertToLatLng = (x: number, y: number): [number, number] => {
    const proj4Module = require("proj4");
    const proj4 = proj4Module.default || proj4Module;

    const epsg2855 =
      "+proj=lcc +lat_0=47 +lon_0=-120.833333333333 +lat_1=48.7333333333333 +lat_2=47.5 +x_0=500000.0001016 +y_0=0 +ellps=GRS80 +units=us-ft +no_defs";
    const wgs84 = "EPSG:4326";

    const [lng, lat] = proj4(epsg2855, wgs84, [x, y]);
    return [lat, lng];
  };

  const defaultCenter: LatLngExpression = [47.6062, -122.3321];
  const mapCenter = center || defaultCenter;

  // Create a stable key based on center coordinates
  const mapKey = useMemo(() => {
    const coords = mapCenter as [number, number];
    return `${coords[0]}-${coords[1]}`;
  }, [mapCenter]);

  if (!isClient) {
    if (process.env.NODE_ENV !== "production") {
      // Helps in browser devtools to show that server/initial render used the placeholder
      console.debug(
        "SeattleMap: rendering placeholder to reserve layout during SSR/initial hydration"
      );
    }

    return (
      <div style={{ height: "550px", width: "100%", background: "#e5e7eb" }} />
    );
  }

  const { MapContainer, TileLayer, Marker, Popup } = require("react-leaflet");
  const L = require("leaflet");

  // Create custom small icon that grows on hover
  const createCustomIcon = (isHovered: boolean) =>
    L.divIcon({
      className: "custom-marker",
      html: `<div style="
      width: ${isHovered ? "16px" : "8px"};
      height: ${isHovered ? "16px" : "8px"};
      background-color: #3b82f6;
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      transition: all 0.2s ease;
      cursor: pointer;
    "></div>`,
      iconSize: [isHovered ? 16 : 8, isHovered ? 16 : 8],
      iconAnchor: [isHovered ? 8 : 4, isHovered ? 8 : 4],
    });

  return (
    <MapContainer
      key={mapKey} // This forces remount when center changes
      center={mapCenter}
      zoom={zoom}
      style={{ height: "550px", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {blockfaces?.map((b, i) => {
        const markerPos: LatLngExpression = convertToLatLng(
          b.center[1],
          b.center[0]
        );
        const startLatLng = convertToLatLng(b.start[1], b.start[0]);
        const endLatLng = convertToLatLng(b.end[1], b.end[0]);

        return (
          <Marker
            key={`blockface-${i}-${b.blockface}`}
            position={markerPos}
            icon={createCustomIcon(hoveredIndex === i)}
            eventHandlers={{
              click: () => handleChange(b.blockface, b.studyArea),
              mouseover: () => setHoveredIndex(i),
              mouseout: () => setHoveredIndex(null),
            }}
          >
            <Popup>
              <strong>{b.blockface}</strong>
              <br />
              Start: {startLatLng[0].toFixed(5)}, {startLatLng[1].toFixed(5)}
              <br />
              End: {endLatLng[0].toFixed(5)}, {endLatLng[1].toFixed(5)}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
