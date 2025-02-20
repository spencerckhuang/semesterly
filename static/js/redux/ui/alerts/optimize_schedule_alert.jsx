import PropTypes from "prop-types";
import React from "react";

export const AlertCoursePlanType = {
  EMPTY: 0,
  EXCEEDS_LIMIT: 1,
  NO_FEASIBLE_SCHEDULE: 2,
  UNKNOWN: 3, // Added a default case
};

/**
 * This alert pops up when the user encounters errors when using schedule optimization
 */
class OptimizeScheduleAlert extends React.Component {
  componentWillUnmount() {
    this.props.dismissSelf();
  }

  handleClick() {
    this.props.dismissSelf();
  }

  render() {
    const { alertCoursePlanType } = this.props;

    let message;
    switch (alertCoursePlanType) {
      case AlertCoursePlanType.EMPTY:
        message = "There is no course in your course plan! Try 'Add All'.";
        break;
      case AlertCoursePlanType.EXCEEDS_LIMIT:
        message = "Your course plan exceeds the maximum limit. Remove some courses.";
        break;
      case AlertCoursePlanType.NO_FEASIBLE_SCHEDULE:
        message =
          "There is no feasible schedule given the courses. Consider removing some courses and try again!";
        break;
      default:
        message = "An unknown error occurred with your course plan.";
    }

    return <div className="optimize-schedule-alert">{message}</div>;
  }
}

OptimizeScheduleAlert.propTypes = {
  dismissSelf: PropTypes.func.isRequired,
  alertCoursePlanType: PropTypes.oneOf(Object.values(AlertCoursePlanType)).isRequired,
};

export default OptimizeScheduleAlert;
