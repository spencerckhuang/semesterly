import React from "react";
import { useState } from "react";

// Function to parse Hopkins course codes transferred in from other institutions
// The regex captures the course code in the format "as.xxx.xxx / en.xxx.xxx / tr.xxx.xxx"
export function parseTransferCourse(text: string): string[] {
  const regex = /\b((EN|AS|TR)\.\d{3}\.\d{3})\b/g;
  const matches = Array.from(text.matchAll(regex));
  return matches.map(match => match[1]); // match[1] is the full course code
}

// Function to parse Hopkins course codes from a given text
// The regex captures the course code in the format "EN / AS" + "dept" + "xxx.xxx"
export function parseHopkinsCourse(text: string): string[] {
  const regex = /(EN|AS)\n*.*\n.*\s(\d{3}\.\d{3})/g;
  const matches = Array.from(text.matchAll(regex));
  return matches.map(match => `${match[1]}.${match[2]}`);
}


// Main component for file reading and storing parsed data from transcripts
export default function FileReaderComponent() {
    const [courseCodes, setCourseCodes] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);  // Ref to the hidden file input
  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = () => {
        const fileText = reader.result as string;
        
        // Parse the file content and store as an array of course codes
        const parsedTransferCourses = parseTransferCourse(fileText);
        const parsedHopkinsCourses = parseHopkinsCourse(fileText);
        const courseCodes = [...parsedTransferCourses, ...parsedHopkinsCourses];
        setCourseCodes(courseCodes); 
  
        // Clear file input
        e.target.value = ""; 
        console.log("File read and data stored locally.");
      };
      reader.readAsText(file);
    };
  
    const handleOpenFileDialog = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click(); // Trigger the file input dialog when the button is clicked
      }
    };
  
    const handleOpenModal = () => {
      console.log("All Course Codes:", courseCodes);
    };
  
    return (
      <div>
        <button onClick={handleOpenFileDialog}>Upload Transcript</button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}  
          onChange={handleFileChange}  
          // Hide the file input element and trigger it when the button is clicked
        />
      </div>
    );
  }