import React, { useMemo, useState } from "react";
import { Course, PrereqModeStatus } from "../constants/commonTypes";

// Regex to extract course IDs (like XX.###.###)
const COURSE_ID_REGEX = /\b[a-z]{2,3}\.\d{3}\.\d{3}\b/i;

interface CheckPrerequisitesProps {
  prerequisites: Course["prerequisites"]; // raw prerequisite string (just the pre-req text)
}

const CheckPrerequisites: React.FC<CheckPrerequisitesProps> = ({ prerequisites }) => {
  const [missingCourses, setMissingCourses] = useState<string[]>([]);

  // Tokenize the prerequisite string into course codes and operators
  const tokenizePrereq = (prereqStr: string) => {
    const tokens = prereqStr.match(/\b[a-z]{2,3}\.\d{3}\.[0-9]{3}\b|and|or|\(|\)/gi);
    return tokens ? tokens.map(t => t.toLowerCase()) : [];
  };

  // Parse tokens into a tree for parentheses
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

  // Evaluate the tree against completed courses
  const evaluateTree = (tree: any, completedCourses: string[]): string[] => {
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

  const handleCheck = () => {
    if (!prerequisites) return;

    const prereqLower = prerequisites.toLowerCase();

    // Extract all course IDs to ensure we only process valid courses
    const matchedCourses = prereqLower.match(/\b[a-z]{2,3}\.\d{3}\.[0-9]{3}\b/gi);
    if (!matchedCourses || matchedCourses.length === 0) {
      setMissingCourses([]);
      return;
    }

    const tokens = tokenizePrereq(prereqLower);
    const tree = parseTokens(tokens);

    const transcriptData = JSON.parse(localStorage.getItem("transcriptData") || "{}");
    const completedCourses: string[] = (transcriptData.courses || []).map((c: string) => c.toLowerCase());

    const missing = evaluateTree(tree, completedCourses);

    // Convert missing course codes back to uppercase
    const missingUpper = missing
      .map(c => c.toUpperCase())
      .filter((course, idx, arr) => arr.indexOf(course) === idx);

    setMissingCourses(missingUpper);
  };

  return (
    <div>
      <h3>Check Prerequisites</h3>
      <button onClick={handleCheck}>Check</button>

      {missingCourses.length === 0 ? (
        <p style={{ color: "green" }}>✅ All prerequisites satisfied</p>
      ) : (
        <div>
          <p style={{ color: "red" }}>❌ Missing prerequisites:</p>
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
