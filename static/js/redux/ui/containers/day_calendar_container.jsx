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

import { connect } from "react-redux";
import DayCalendar from "../day_calendar";
import { saveTimetable } from "../../actions/user_actions";
import { handleCreateNewTimetable } from "../../actions/timetable_actions";
import {
  createICalFromTimetable,
  fetchShareTimetableLink,
} from "../../actions/calendar_actions";
import { getMaxEndHour } from "../../state";
import { preferencesActions } from "../../state/slices/preferencesSlice";
import { saveCalendarModalActions } from "../../state/slices/saveCalendarModalSlice";

const mapStateToProps = (state) => {
  const { isFetchingShareLink, shareLink, shareLinkValid } = state.calendar;
  return {
    endHour: getMaxEndHour(state),
    saving: state.savingTimetable.saving,
    isLoggedIn: state.userInfo.data.isLoggedIn,
    uses12HrTime: state.ui.uses12HrTime,
    isFetchingShareLink,
    shareLink,
    shareLinkValid,
    active: state.timetables.active,
  };
};

const DayCalendarContainer = connect(mapStateToProps, {
  // NOTE: uses this syntax to avoid onClick accidentally passing a callback
  saveTimetable: () => saveTimetable(),
  fetchShareTimetableLink,
  showPreferenceModal: preferencesActions.showPreferenceModal,
  triggerSaveCalendarModal: saveCalendarModalActions.toggleSaveCalendarModal,
  createICalFromTimetable,
  handleCreateNewTimetable,
})(DayCalendar);

export default DayCalendarContainer;
