import React, { useState } from "react";

// Helper regexes
const COURSE_ID_REGEX = /\b[a-z]{2,3}\.\d{3}\.\d{3}\b/i;

const CREDIT_RESTRICTION_PATTERNS = [
  /students may only receive credit for/i,
  /credit cannot be received for both/i,
  /may only receive credit for one of/i,
  /no student may receive credit for/i,
  /credit will not be granted for/i,
  /students may receive credit for only one/i,
];

const ENROLLMENT_RESTRICTION_PATTERNS = [
  /may not enroll if/i,
  /not open to students who have taken/i,
];

const isCreditRestriction = (text: string) =>
  CREDIT_RESTRICTION_PATTERNS.some((pat) => pat.test(text));

const isEnrollmentRestriction = (text: string) =>
  ENROLLMENT_RESTRICTION_PATTERNS.some((pat) => pat.test(text));

const cleanPrerequisiteString = (prereqStr: string) => {
  let s = prereqStr.toLowerCase().replace(/\s+/g, " ").replace(/\n+/g, " ").trim();
  const parts = s.split(";").map(p => p.trim()).filter(p => !isCreditRestriction(p) && !isEnrollmentRestriction(p));
  return parts.join(" ");
};

const tokenizePrereq = (prereqStr: string) => {
  const tokens = prereqStr.match(/\b[a-z]{2,3}\.\d{3}\.[0-9]{3}\b|and|or|\(|\)/gi);
  return tokens ? tokens.map(t => t.toLowerCase()) : [];
};

const parseTokens = (tokens: string[]) => {
  const parseExpression = (index: number): [any[], number] => {
    const expr: any[] = [];
    while (index < tokens.length) {
      const token = tokens[index];
      if (token === "(") {
        const [subExpr, nextIndex] = parseExpression(index + 1);
        expr.push(subExpr);
        index = nextIndex;
      } else if (token === ")") {
        return [expr, index];
      } else {
        expr.push(token);
      }
      index++;
    }
    return [expr, index];
  };
  const [tree] = parseExpression(0);
  return tree;
};

const evaluateTree = (tree: any, completedCourses: string[]): string[] => {
  // Returns an array of missing course codes (in lowercase)
  if (typeof tree === "string") {
    return completedCourses.includes(tree) ? [] : [tree];
  }

  let missing: string[] = [];
  let i = 0;
  while (i < tree.length) {
    const token = tree[i];
    if (Array.isArray(token)) {
      missing = missing.concat(evaluateTree(token, completedCourses));
    } else if (token === "and") {
      const leftMissing = missing;
      const rightMissing = evaluateTree(tree[i + 1], completedCourses);
      missing = [...leftMissing, ...rightMissing];
      i++;
    } else if (token === "or") {
      const leftMissing = missing;
      const rightMissing = evaluateTree(tree[i + 1], completedCourses);
      // Only include both if neither satisfied
      if (leftMissing.length && rightMissing.length) {
        missing = [...leftMissing, ...rightMissing];
      } else {
        missing = [];
      }
      i++;
    } else {
      if (!completedCourses.includes(token)) missing.push(token);
    }
    i++;
  }
  return missing;
};

// React component
interface CheckPrerequisitesProps {
  courseText?: string; // raw course description text
  courseName?: string;
}

const CheckPrerequisites: React.FC<CheckPrerequisitesProps> = ({ courseText, courseName }) => {
  const [missingCourses, setMissingCourses] = useState<string[]>([]);

  const handleCheck = () => {
    if (!courseText) return;

    // lowercase copy for parsing
    const prereqLower = courseText.toLowerCase();
    const cleaned = cleanPrerequisiteString(prereqLower);
    const tokens = tokenizePrereq(cleaned);
    const tree = parseTokens(tokens);

    const transcriptData = JSON.parse(localStorage.getItem("transcriptData") || "{}");
    const completedCourses: string[] = (transcriptData.courses || []).map((c: string) => c.toLowerCase());

    const missing = evaluateTree(tree, completedCourses);
    setMissingCourses(missing.map(c => c.toUpperCase())); // convert back to uppercase
  };

  return (
    <div>
      <h3>Check Prerequisites</h3>
      <button onClick={handleCheck}>Check</button>
      {missingCourses.length === 0 ? (
        <p style={{ color: "green" }}>✅ All prerequisites satisfied for {courseName}</p>
      ) : (
        <div>
          <p style={{ color: "red" }}>❌ Missing prerequisites for {courseName}:</p>
          <ul>
            {missingCourses.map((course, idx) => (
              <li key={idx}>{course}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CheckPrerequisites;
