"use client";

import SeattleMap from "@/components/seattleMapWrapper";
import StudyArea from "@/components/studyArea";
import React, { useState, useMemo } from "react";
import { studyAreaCenters } from "@/constants/studyAreaConstants";

export default function ParkingPredictor() {
  const [form, setForm] = useState({
    Study_Area: "",
    Unitdesc: "",
    Side: "",
    Hour: "",
    Construction: 0,
  });

  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    47.6062, -122.3321,
  ]);
  const mapKey = useMemo(() => `${mapCenter[0]}-${mapCenter[1]}`, [mapCenter]);

  const handleStudyAreaChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const newStudyArea = e.target.value;

    const newCenter = studyAreaCenters[newStudyArea];
    if (newCenter) {
      const centerArray: [number, number] = Array.isArray(newCenter)
        ? [newCenter[0], newCenter[1]]
        : [newCenter.lat, newCenter.lng];
      setMapCenter(centerArray);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "Construction" ? (value === "yes" ? 1 : 0) : value,
    }));
  };

  const handleMapChange = (blockface: string, studyArea: string) => {
    setForm((prev) => ({
      ...prev,
      Unitdesc: blockface,
      Study_Area: studyArea,
    }));
  };

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;


  const submit = async () => {
    setLoading(true);
    setPrediction(null);

    const res = await fetch(`${backendUrl}/predict`, {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    setPrediction(data.available_parking_spaces);
    setLoading(false);
  };

  return (
    <div className="max-w-lg p-6 mx-auto rounded-xl shadow border">
      <h1 className="text-xl font-semibold mb-4">
        Predict Parking Availability
      </h1>

      <div className="grid grid-cols-1 gap-3">
        <StudyArea handleChange={handleStudyAreaChange} />

        <div className="">
          <SeattleMap
            handleChange={handleMapChange}
            center={mapCenter}
            zoom={14}
          />
          <h1>Selected Street: {form.Unitdesc}</h1>
          <br />
          <h1>Selected Study Area: {form.Study_Area}</h1>
        </div>
        <h1>Select side: </h1>
        <select
          name="Side"
          className="border p-2 rounded"
          value={form.Side}
          onChange={handleChange}
        >
          <option value="">Select side...</option>
          <option value="n">north</option>
          <option value="s">south</option>
          <option value="e">east</option>
          <option value="w">west</option>
        </select>
        <h1>Input hour: </h1>
        <input
          type="number"
          name="Hour"
          placeholder="Hour (0-23)"
          className="border p-2 rounded"
          value={form.Hour}
          onChange={handleChange}
        />
        <h1>Is there construction: </h1>
        <select
          name="Construction"
          className="border p-2 rounded"
          value={form.Construction === 1 ? "yes" : "no"}
          onChange={handleChange}
        >
          <option value="">Construction?</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <button
        onClick={submit}
        className="mt-4 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Predict
      </button>

      {loading && <p className="mt-3 text-gray-600">Running prediction...</p>}

      {prediction !== null && (
        <p className="mt-3 font-bold text-green-600">
          Estimated Available Parking Spaces: {Math.round(prediction)}
        </p>
      )}
    </div>
  );
}
