"use client"; // Next 13 app directory

import dynamic from "next/dynamic";
import type { LatLngExpression } from "leaflet";

const SeattleMap = dynamic(() => import("./seattleMap"), { ssr: false });

interface SeattleMapWrapperProps {
  handleChange: (blockface: string, studyArea: string) => void;
  center?: LatLngExpression;
  zoom?: number;
}

export default function SeattleMapWrapper({
  handleChange,
  center,
  zoom,
}: SeattleMapWrapperProps) {
  return <SeattleMap handleChange={handleChange} center={center} zoom={zoom} />;
}
