"use client";

import { useState } from "react";
import { Message, FileData } from "./types/message";
import FileUpload from "./components/FileUpload";
import FileList from "./components/FileList";
import { analyzeFileContents } from "./utils/fileAnalysis";
import { Anthropic } from "@anthropic-ai/sdk";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (data: FileData) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze file");
      }

      const analyzedData = await response.json();

      setFiles((prev) => [...prev, analyzedData]);
      // setMessages((prev) => [
      //   ...prev,
      //   {
      //     role: "assistant",
      //     content: `I've analyzed "${analyzedData.fileName}".\n\n${
      //       analyzedData.summary
      //     }\n\nKey topics: ${analyzedData.topics.join(", ")}`,
      //   },
      // ]);
    } catch (err) {
      setError("Failed to analyze file contents. Please try again.");
      console.error("Error analyzing file:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setFiles((prev) => prev.filter((file) => file.fileName !== fileName));
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Removed file "${fileName}" from the analysis.`,
      },
    ]);
  };

  const checkRelevantData = async (prompt: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/check-relevance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, files }),
      });

      if (!response.ok) {
        throw new Error("Failed to check data relevance");
      }

      const { hasRelevantData, explanation } = await response.json();

      if (!hasRelevantData) {
        setMessages((prev) => [
          ...prev,
          { role: "user", content: prompt },
          { role: "assistant", content: explanation },
        ]);
      }

      return hasRelevantData;
    } catch (error) {
      console.error("Error checking relevance:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    // If no files uploaded yet, immediately inform the user
    if (files.length === 0) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: prompt },
        {
          role: "assistant",
          content:
            "You haven't uploaded any data files yet. Please upload some data first and I'll help you analyze it.",
        },
      ]);
      setIsLoading(false);
      setPrompt("");
      return;
    }

    // Check if we have relevant data for this request
    const hasRelevantData = await checkRelevantData(prompt);
    if (!hasRelevantData) {
      setIsLoading(false);
      setPrompt("");
      return;
    }

    // Proceed with the regular chat flow if we have relevant data
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, files }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();

      // Handle both regular responses and CSV generation
      let content = data.content[0].text;

      // If the response contains CSV data, format it nicely
      if (
        content.includes(",") &&
        content.includes("\n") &&
        !content.includes("```")
      ) {
        const rows = content.trim().split("\n");
        const headers = rows[0].split(",");

        content =
          `Generated CSV file with ${rows.length - 1} rows and ${
            headers.length
          } columns:\n\n` + content;
      }

      setMessages((prev) => [
        ...prev,
        { role: "user", content: prompt },
        { role: "assistant", content },
      ]);

      setPrompt("");
    } catch (err) {
      setError("Failed to fetch response from Claude. Please try again.");
      console.error("Error in chat:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">
        Chat with Claude
      </h1>

      <FileUpload onFileUpload={handleFileUpload} />

      {files.length > 0 && (
        <FileList files={files} onRemoveFile={handleRemoveFile} />
      )}

      <div className="bg-white rounded-lg shadow-lg mb-6 p-4 h-[500px] overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 p-4 rounded-lg ${
              message.role === "user"
                ? "bg-blue-600 ml-12 text-white"
                : "bg-gray-200 mr-12 text-gray-900"
            }`}
          >
            <p className="font-semibold mb-1">
              {message.role === "user" ? "You" : "Claude"}
            </p>
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 font-medium">
            {error}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your message..."
          className="flex-1 p-4 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-gray-900 placeholder-gray-500 bg-white"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
        >
          Send
        </button>
      </form>
    </main>
  );
}
