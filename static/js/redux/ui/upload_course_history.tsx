import React from "react";
import { useState, useRef } from "react";


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
  export function parseTranscriptData(file: File): Promise<string[]> {
    return new Promise((resolve, reject) => {
        console.log("File:", file);
        if (!file) {
            reject(new Error("No file provided."));
        resolve([]); // Placeholder for the actual implementation
        
    });
    
  }