/*
Copyright (C) 2017 Semester.ly Technologies, LLC

Semester.ly is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Semester.ly is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
*/

import React from "react";
import { useAppSelector } from "../hooks";
import { selectSlotColorData } from "../state/slices/themeSlice";

interface SlotHoverTipProps {
  mode?: "code" | "name";
  num: number;
  code: string;
  name: string;
  getShareLinkFromModal: (code: string) => string;
}

/**
 * This component appears in the CourseModalBody and is used to link to other courses
 * for pre-requisites and co-requisites. When hovered over, the underlined course code
 * also displays the course name, and clicking on it will link to that course.
 */
const SlotHoverTip = ({
  mode = "name",
  num,
  code,
  name,
  getShareLinkFromModal,
}: SlotHoverTipProps) => {
  const colorData = useAppSelector(selectSlotColorData);
  const maxColourIndex = colorData.length - 1;
  return (
    <a href={getShareLinkFromModal(code)} className="course-link" key={num}>
      <span>{mode === "name" ? name : code}</span>
      <span
        className="course-link-tip"
        style={{
          backgroundColor: colorData[Math.min(num - 1, maxColourIndex)].background,
        }}
      >
        <span
          className="slot-bar"
          style={{
            backgroundColor: colorData[Math.min(num - 1, maxColourIndex)].border,
          }}
        />
        <span className="course-link-content">
          <span>{code}</span>
          <span>{name}</span>
        </span>
      </span>
    </a>
  );
};

export default SlotHoverTip;
