import React, { useState } from "react";

interface CheckPrerequisitesProps {
  prerequisites?: string; // the raw prerequisite string from the course
}

const CheckPrerequisites: React.FC<CheckPrerequisitesProps> = ({ prerequisites }) => {
  const [missingPrereqs, setMissingPrereqs] = useState<string[]>([]);

  const handlePrereqCheck = () => {
    const transcriptData = JSON.parse(localStorage.getItem("transcriptData") || "{}");
    const completedCourses: string[] = transcriptData.courses || [];

    if (!prerequisites) {
      setMissingPrereqs([]);
      return;
    }

    // Simple parsing logic: split by "AND" and "OR"

  return (
    <div className="check-prerequisites">
      <h3>Check Prerequisites Fulfilled</h3>
      <p>Click the button to see if you've met all the pre-requisites for this course!</p>
      <button onClick={handlePrereqCheck}>Check Prerequisites</button>

      {missingPrereqs.length === 0 ? (
        <p style={{ color: "green" }}>✅ All prerequisites satisfied!</p>
      ) : (
        <div>
          <p style={{ color: "red" }}>❌ Missing prerequisites:</p>
          <ul>
            {missingPrereqs.map((course, idx) => (
              <li key={idx}>{course}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CheckPrerequisites;
