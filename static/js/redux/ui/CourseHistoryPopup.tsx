import React, { useEffect, useState } from "react";

interface TranscriptData {
  courses: string[];
  lastUpdated?: string;
}

export const CourseHistoryPopup = ({ onClose }: { onClose: () => void }) => {
  const [courses, setCourses] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    try {
      const savedData = localStorage.getItem("transcriptData");
      if (savedData) {
        const parsedData: TranscriptData = JSON.parse(savedData);
        setCourses(parsedData.courses || []);
        setLastUpdated(parsedData.lastUpdated || "");
      }
    } catch (error) {
      console.error("Failed to load transcript:", error);
    }
  }, []);

  // Handle click outside the popup
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Course History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close popup"
          >
            &times;
          </button>
        </div>

        {lastUpdated && (
          <p className="text-sm text-gray-500 mb-4">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </p>
        )}

        {courses.length > 0 ? (
          <ul className="space-y-2">
            {courses.map((course, index) => (
              <li key={index} className="p-2 border-b border-gray-100">
                {course}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No course history found</p>
        )}
      </div>
    </div>
  );
};
