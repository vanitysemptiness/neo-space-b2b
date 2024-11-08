export interface Message {
    role: 'user' | 'assistant';
    content: string;
  }
  
  export interface FileData {
    fileName: string;
    sheets: {
      [key: string]: any[][];
    };
    summary?: string; // AI-generated summary of file contents
    topics?: string[]; // Key topics identified in the file
  }