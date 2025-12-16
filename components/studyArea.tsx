import { studyAreaOptions } from "@/constants/studyAreaConstants";

interface StudyAreaProps {
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function StudyArea({ handleChange }: StudyAreaProps) {
  return (
    <div>
      <h1>Select focus area: </h1>
      <select
        className="border p-2 rounded"
        name="Study_Area"
        onChange={handleChange}
      >
        <option value="">Select Study Area</option>
        {[...studyAreaOptions].sort().map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
