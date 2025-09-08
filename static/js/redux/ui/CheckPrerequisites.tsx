import React, { useState } from "react";
import { Course } from "../constants/commonTypes";

// Regex to extract course IDs (like XX.###.###)
const COURSE_ID_REGEX = /\b[a-z]{2,3}\.\d{3}\.\d{3}\b/i;

// Credit restriction patterns
const CREDIT_RESTRICTION_PATTERNS: RegExp[] = [
  /students may only receive credit for/i,
  /credit cannot be received for both/i,
  /may only receive credit for one of/i,
  /no student may receive credit for/i,
  /credit will not be granted for/i,
  /students may receive credit for only one/i,
];

// Enrollment restriction patterns
const ENROLLMENT_RESTRICTION_PATTERNS: RegExp[] = [
  /may not enroll if/i,
  /not open to students who have taken/i,
];

// Helpers to detect restrictions
const isCreditRestriction = (text: string): boolean => {
  return CREDIT_RESTRICTION_PATTERNS.some((pattern) => pattern.test(text));
};

const isEnrollmentRestriction = (text: string): boolean => {
  return ENROLLMENT_RESTRICTION_PATTERNS.some((pattern) => pattern.test(text));
};

// Clean a prereq string (remove restrictions, normalize spacing)
const cleanPrerequisiteString = (prerequisiteString: string): string => {
  let cleaned = prerequisiteString.toLowerCase();
  cleaned = cleaned.replace(/\s+/g, " ");
  cleaned = cleaned.replace(/\n+/g, " ").trim();

  const parts = cleaned.split(";");

  const cleanParts = parts.filter(
    (part) => !isCreditRestriction(part) && !isEnrollmentRestriction(part)
  );

  return cleanParts.join(" ");
};

interface CheckPrerequisitesProps {
  prerequisites: Course["prerequisites"];
}

const CheckPrerequisites: React.FC<CheckPrerequisitesProps> = (props: CheckPrerequisitesProps) => {
  const { prerequisites } = props;
  const [missingCourses, setMissingCourses] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);


  // Tokenize the prerequisite string into course codes and operators
  const tokenizePrereq = (prereqStr: string) => {
    const tokens = prereqStr.match(/\b[a-z]{2,3}\.\d{3}\.\d{3}\b|and|or|\(|\)/gi);
    return tokens ? tokens.map((t) => t.toLowerCase()) : [];
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
  const evaluateTree = (tree: any, completedCourses: string[]): [boolean, string[]] => {
    if (typeof tree === "string") {
      if (tree === "and" || tree === "or") return [true, []]; // operators themselves
      if (completedCourses.includes(tree)) {
        return [true, []];
      }
      return [false, [tree]];
    }

    let i = 0;
    let satisfied = null;
    let missing: string[] = [];

    while (i < tree.length) {
      const token = tree[i];

      if (token === "and") {
        const [rightSat, rightMiss] = evaluateTree(tree[i + 1], completedCourses);
        satisfied = (satisfied ?? true) && rightSat;
        if (!rightSat) missing.push(...rightMiss);
        i++;
      } else if (token === "or") {
        const [rightSat, rightMiss] = evaluateTree(tree[i + 1], completedCourses);
        if (satisfied) {
          // already satisfied by left
          satisfied = true;
          missing = [];
        } else if (rightSat) {
          satisfied = true;
          missing = [];
        } else {
          satisfied = false;
          missing = [...missing, ...rightMiss];
        }
        i++;
      } else {
        const [subSat, subMiss] = Array.isArray(token)
          ? evaluateTree(token, completedCourses)
          : evaluateTree(token, completedCourses);
        satisfied = (satisfied ?? true) && subSat;
        if (!subSat) missing.push(...subMiss);
      }
      i++;
    }

    return [satisfied ?? true, missing];
  };


  const handleCheck = () => {
    setChecked(true);
    if (!prerequisites) return;

    // Clean prereqs (remove restrictions, normalize spacing)
    const prereqLower = cleanPrerequisiteString(prerequisites);

    // Extract all course IDs to ensure we only process valid courses
    const matchedCourses = prereqLower.match(COURSE_ID_REGEX);
    if (!matchedCourses || matchedCourses.length === 0) {
      setMissingCourses([]);
      return;
    }

    const tokens = tokenizePrereq(prereqLower);
    const tree = parseTokens(tokens);

    const transcriptData = JSON.parse(localStorage.getItem("transcriptData") || "{}");
    const completedCourses: string[] = (transcriptData.courses || []).map((c: string) =>
      c.toLowerCase()
    );

    const [satisfied, missing] = evaluateTree(tree, completedCourses);
    // report courses in uppercase as standard
    setMissingCourses(
      satisfied ? [] : [...new Set(missing.map((c) => c.toUpperCase()))]
    );
  };


  return (
    <div>
      <h5>Check Prerequisites</h5>
      <button onClick={handleCheck}>Check</button>

      {checked && (
        missingCourses.length === 0 ? (
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
        )
      )}
    </div>
  );
};

export default CheckPrerequisites;
