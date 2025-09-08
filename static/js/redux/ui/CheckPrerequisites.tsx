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

    const splitRegex = /(AND|OR|\(|\)|[A-Z]{2}\.[0-9]{3}\.[0-9]{3})/g;
    const parts = prerequisites
      .split(splitRegex)
      .map(p => p.trim())
      .filter(Boolean);

    const evalRecursive = (i = 0): [boolean, string[], number] => {
      let satisfied = true;
      let missing: string[] = [];
      let currentOp: "AND" | "OR" | null = null;

      while (i < parts.length) {
        const token = parts[i];

        if (token === ")") return [satisfied, missing, i + 1];

        if (token === "(") {
          const [subSat, subMiss, nextIdx] = evalRecursive(i + 1);
          i = nextIdx;
          if (currentOp === "OR") {
            satisfied = satisfied || subSat;
            if (!subSat) missing.push(...subMiss);
          } else {
            satisfied = satisfied && subSat;
            missing.push(...subMiss);
          }
          continue;
        }

        if (token === "AND" || token === "OR") {
          currentOp = token;
        } else if (/^[A-Z]{2}\.[0-9]{3}\.[0-9]{3}$/.test(token)) {
          const hasCourse = completedCourses.includes(token);
          if (currentOp === "OR") {
            satisfied = satisfied || hasCourse;
            if (!hasCourse) missing.push(token);
          } else {
            satisfied = satisfied && hasCourse;
            if (!hasCourse) missing.push(token);
          }
        }

        i++;
      }

      return [satisfied, missing, i];
    };

    const [ok, missing] = evalRecursive(0);
    setMissingPrereqs(missing);
  };

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
