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

/* eslint camelcase: "off" */

import fetch from "isomorphic-fetch";
import Cookie from "js-cookie";
import { alertsActions } from "../state/slices";
import { postTranscriptEndpoint } from "../constants/endpoints";

// POST a transcript to the backend for parsing
export const postTranscript =
  (formData) =>
  (dispatch) => {
    return fetch(postTranscriptEndpoint(), {
      method: "POST",
      body: formData,
      headers: {
        "X-CSRFToken": Cookie.get("csrftoken"),
        // browser sets Content-Type header for FormData automatically
      },
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Transcript upload failed");
        }
        return response.json();
      })
      .then((data) => {
        // handle success
        return data;
      })
      .catch((error) => {
        dispatch(alertsActions.alertUploadFailed());
        throw error;
      });
  };
