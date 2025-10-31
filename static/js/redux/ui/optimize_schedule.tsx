// Helper functions for scheduling courses
/* eslint no-shadow: "off" */
import { DenormalizedCourse, Section } from "../constants/commonTypes";

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function isFeasible(schedule: Section[], newSection: Section): boolean {
  return !schedule.some((section) =>
    newSection.offering_set.some((newTime) =>
      section.offering_set.some(
        (existingTime) =>
          newTime.day === existingTime.day &&
          newTime.time_start < existingTime.time_end &&
          newTime.time_end > existingTime.time_start &&
          // Check if time overlaps for half-semester courses
          newTime.date_start <= existingTime.date_end &&
          newTime.date_end >= existingTime.date_start,
      ),
    ),
  );
}

function calculateTotalGaps(schedule: Section[]): number {
  const daySlots: Record<string, { start: number; end: number }[]> = {};

  schedule.forEach((section) => {
    section.offering_set.forEach((time) => {
      const { day } = time;
      if (!daySlots[day]) daySlots[day] = [];
      daySlots[day].push({
        start: timeToMinutes(time.time_start),
        end: timeToMinutes(time.time_end),
      });
    });
  });

  let totalGaps = 0;

  Object.keys(daySlots).forEach((day) => {
    const slots = daySlots[day].sort((a, b) => a.start - b.start);
    for (let i = 1; i < slots.length; i++) {
      const gap = slots[i].start - slots[i - 1].end;
      if (gap > 0) totalGaps += gap;
    }
  });

  return totalGaps;
}

function getFeasibleSchedules(
  courses: DenormalizedCourse[],
  lockedSections: Section[],
): Section[][] {
  const schedules: Section[][] = [];
  // backtracking to not explore branches of tree that is alreadt infeasible
  function backtrack(currentSchedule: Section[], courseIndex: number) {
    if (courseIndex === courses.length) {
      schedules.push(currentSchedule);
      return;
    }
    const currentCourse = courses[courseIndex];
    let hasSyncSections = false;
    currentCourse.sections.forEach((section) => {
      if (section.offering_set.length > 0) {
        hasSyncSections = true;
        if (isFeasible([...currentSchedule, ...lockedSections], section)) {
          backtrack([...currentSchedule, section], courseIndex + 1);
        }
      }
    });
    if (!hasSyncSections && currentCourse.sections.length > 0) {
      // Add first async section and continue
      backtrack([...currentSchedule, currentCourse.sections[0]], courseIndex + 1);
    }
  }
  backtrack(lockedSections, 0);
  return schedules;
}

function calculateEarlyClassAmounts(
  schedule: Section[],
  earlyThreshold: number,
): number {
  let amount = 0;
  schedule.forEach((section) => {
    section.offering_set.forEach((offering) => {
      const [hours, minutes] = offering.time_start.split(":").map(Number);
      const start = hours + minutes / 60;
      if (start < earlyThreshold) {
        amount += earlyThreshold - start;
      }
    });
  });
  return amount;
}

export enum SchedulePolicy {
  MINIMAL_GAPS = 0,
  MINIMAL_EARLY_CLASSES = 1,
}

/**
 * Finds the top schedules based on a specified policy.
 *
 * @param {DenormalizedCourse[]} courses - Array of courses, where each course contains sections and their offerings.
 * @param {Section[]} lockedSections - Array of sections that must be included in every feasible schedule.
 * @param {SchedulePolicy} policy - Ranking policy
 * @param {number} topN - Number of top schedules to return.
 * @returns {Array<{ schedule: Section[] }>} An array of objects containing the top schedules based on the given policy.
 */
function findTopSchedules(
  courses: DenormalizedCourse[],
  lockedSections: Section[],
  policy: SchedulePolicy = SchedulePolicy.MINIMAL_GAPS,
  topN = 1, // number of schedules we want to return
): Array<{ schedule: Section[] }> {
  let rankedSchedules; // output schedule

  const combinations = getFeasibleSchedules(courses, lockedSections);
  if (combinations.length === 0 || topN < 1) return []; // return if there's no feasible schedule

  // handle policy cases
  switch (policy) {
    case SchedulePolicy.MINIMAL_GAPS:
    default:
      rankedSchedules = combinations
        .map((schedule) => ({ schedule, totalGaps: calculateTotalGaps(schedule) }))
        .sort((a, b) => a.totalGaps - b.totalGaps);
      break;
    case SchedulePolicy.MINIMAL_EARLY_CLASSES:
      rankedSchedules = combinations
        .map((schedule) => ({
          schedule,
          earlyClassAmounts: calculateEarlyClassAmounts(schedule, 10), // time <= 10 AM is early class
        }))
        .sort((a, b) => a.earlyClassAmounts - b.earlyClassAmounts);
      break;
  }

  return rankedSchedules.slice(0, topN);
}

export default findTopSchedules;
