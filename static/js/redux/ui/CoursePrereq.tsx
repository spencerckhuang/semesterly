import React, { useMemo, useState } from "react";
import PrereqRadioGroup from "./PrereqRadioGroup";
import SlotHoverTip from "./SlotHoverTip";
import { Course, PrereqModeStatus } from "../constants/commonTypes";

interface CoursePrereqProps {
  courseRegex: RegExp;
  prerequisites: Course["prerequisites"];
  regexedCourses: Course["regexed_courses"];
  getShareLinkFromModal: (courseCode: string) => string;
}

const CoursePrereq: React.FC<CoursePrereqProps> = ({
  courseRegex,
  prerequisites,
  regexedCourses,
  getShareLinkFromModal,
}) => {
  const [prereqMode, setPrereqMode] = useState(PrereqModeStatus.NAME);

  const partsComponents = {
    Course: (parts: string[], i: number) => (
      <SlotHoverTip
        key={parts[i]}
        mode={
          prereqMode === PrereqModeStatus.ORIGINAL
            ? "name"
            : (prereqMode as "name" | "code")
        }
        num={i}
        code={parts[i]}
        name={regexedCourses[parts[i]]}
        getShareLinkFromModal={getShareLinkFromModal}
      />
    ),
    CourseError: (parts: string[], i: number) => (
      <span key={i} className="prerequisites-error">
        {parts[i]}
      </span>
    ),
    AND: (i: number) => (
      <span key={i} className="prerequisites-and">
        AND
      </span>
    ),
    OR: (i: number) => (
      <>
        <br />
        <span key={i} className="prerequisites-or">
          OR
        </span>
      </>
    ),
  };

  const processPrereqLinear = (parts: string[]) =>
    parts.map((part, i) => {
      if (courseRegex.test(part)) {
        const Component = Object.prototype.hasOwnProperty.call(regexedCourses, part)
          ? partsComponents.Course
          : partsComponents.CourseError;
        return Component(parts, i);
      }
      return part;
    });

  const processPrereqRecursive = (
    parts: string[],
    start: number,
    depth: number
  ): [React.ReactNode, number] => {
    const nodes: React.ReactNode[] = [];
    let i = start;
    while (i < parts.length) {
      const part = parts[i];

      // Handle course regex
      if (courseRegex.test(part)) {
        const Component = Object.prototype.hasOwnProperty.call(regexedCourses, part)
          ? partsComponents.Course
          : partsComponents.CourseError;
        nodes.push(Component(parts, i));
      } else {
        // Handle OR, AND, parentheses, and raw text
        switch (part) {
          case "OR":
            nodes.push(partsComponents.OR(i));
            break;
          case "AND":
            nodes.push(partsComponents.AND(i));
            break;
          case "(": {
            const [node, iNext] = processPrereqRecursive(parts, i + 1, depth + 1);
            nodes.push(node);
            i = iNext - 1; // -1 for i++
            break;
          }
          case ")":
            return [<div style={{ marginLeft: 10 * depth }}>{nodes}</div>, i + 1];
          default:
            nodes.push(part); // Raw text
        }
      }
      i++;
    }

    return [<div style={{ marginLeft: 10 * depth }}>{nodes}</div>, i];
  };

  const newPrerequisites = useMemo(() => {
    if (!prerequisites) return "None";
    const splitRegex = /(AND|OR|\(|\)|[A-Z]{2}\.[0-9]{3}\.[0-9]{3})/g;
    const parts = prerequisites.split(splitRegex);
    if (prereqMode === "original") {
      return processPrereqLinear(parts);
    } else {
      const [node, _] = processPrereqRecursive(parts, 0, 0);
      return node;
    }
  }, [prerequisites, prereqMode]);

  return (
    <div className="modal-module prerequisites">
      <h3 className="modal-module-header">Prerequisites</h3>
      <PrereqRadioGroup active={prereqMode} onChange={setPrereqMode} />
      <p>{newPrerequisites}</p>
    </div>
  );
};

export default CoursePrereq;
