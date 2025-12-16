import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import { blockfaces } from "@/constants/blockfaces";

interface MapContentProps {
  handleChange: (blockface: string) => void;
  center?: LatLngExpression;
  zoom?: number;
}

const convertToLatLng = (x: number, y: number): [number, number] => {
  const proj4 = require("proj4").default;

  const epsg2855 =
    "+proj=lcc +lat_0=47 +lon_0=-120.833333333333 +lat_1=48.7333333333333 +lat_2=47.5 +x_0=500000.0001016 +y_0=0 +ellps=GRS80 +units=us-ft +no_defs";
  const wgs84 = "EPSG:4326";

  const [lng, lat] = proj4(epsg2855, wgs84, [x, y]);
  return [lat, lng];
};

function ChangeView({
  center,
  zoom,
}: {
  center: LatLngExpression;
  zoom: number;
}) {
  const map = useMap();
  const prev = useRef<LatLngExpression | null>(null);

  useEffect(() => {
    const [lat, lng] = center as [number, number];

    if (!prev.current) {
      prev.current = center;
      return;
    }

    const [prevLat, prevLng] = prev.current as [number, number];

    if (lat !== prevLat || lng !== prevLng) {
      map.setView([lat, lng], zoom);
      prev.current = center;
    }
  }, [center, zoom, map]);

  return null;
}

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

export default function MapContent({
  handleChange,
  center,
  zoom = 13,
}: MapContentProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const mapCenter: [number, number] = (center as [number, number]) || [
    47.6062, -122.3321,
  ];

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      style={{ height: "550px", width: "100%" }}
      scrollWheelZoom={true}
    >
      <ChangeView center={mapCenter} zoom={zoom} />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {blockfaces?.map((b, i) => {
        const markerPos: [number, number] = convertToLatLng(
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
              click: () => handleChange(b.blockface),
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
